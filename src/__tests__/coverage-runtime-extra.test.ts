// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import ts from "typescript";
import { loadFrameworkOptionsFile } from "../cli/framework-options-loader.js";
import { parameters as previewParameters, renderToCanvas } from "../preview.js";
import { core, viteFinal } from "../preset.js";
import { RenderRegistry } from "../runtime/render/render-registry.js";
import {
  RequestValidationError,
  resolveExecutionRequest,
} from "../runtime/render/render-request.js";
import initTsPlugin from "../ts-plugin/index.js";
import type { PhpComponent } from "../types.js";

const FIXTURES = resolve(__dirname, "fixtures");

type RenderContext = Parameters<typeof renderToCanvas>[0];
type StoryContext = RenderContext["storyContext"];
type StoryComponent = NonNullable<StoryContext["component"]>;

const phpComponent: PhpComponent = {
  __php: true,
  __id: "cmp_test",
  __type: "classMethod",
  __file: "/path/Component.php",
  __class: "App\\Component",
  __callable: "render",
  __constructorArgs: {},
  __callableArgs: {},
  __allArgs: {},
};

function makeContext(
  component: unknown,
  args: Record<string, unknown> | undefined = {},
): {
  context: RenderContext;
  showMain: ReturnType<typeof vi.fn>;
  showError: ReturnType<typeof vi.fn>;
} {
  const showMain = vi.fn();
  const showError = vi.fn();
  const storyContext: StoryContext = {
    args: args as Record<string, unknown>,
    name: "Test",
    title: "Test",
    id: "test",
    component: component as StoryComponent,
  };

  return {
    context: {
      storyContext,
      storyFn: () => "<div><!-- storybook-php-content --></div>",
      showMain,
      showError,
    },
    showMain,
    showError,
  };
}

describe("coverage runtime extras", () => {
  let tempDir = "";

  beforeEach(() => {
    tempDir = mkdtempSync(join(resolve(process.cwd(), "build"), "sbphp-runtime-"));
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("framework-options-loader", () => {
    it("returns an empty object when no options file is provided", async () => {
      await expect(loadFrameworkOptionsFile(undefined, tempDir)).resolves.toEqual({});
    });

    it("loads JSON and module-based framework options", async () => {
      writeFileSync(
        join(tempDir, "options.json"),
        JSON.stringify({ defaultMethod: "render", _configDir: "/tmp/config" }),
      );
      writeFileSync(
        join(tempDir, "options.mjs"),
        "export default { defaultMethod: 'preview', typeMap: { args: {} } };",
      );
      writeFileSync(join(tempDir, "named.mjs"), "export const defaultMethod = 'named';");

      await expect(loadFrameworkOptionsFile("options.json", tempDir)).resolves.toEqual({
        defaultMethod: "render",
        _configDir: "/tmp/config",
      });
      await expect(loadFrameworkOptionsFile("options.mjs", tempDir)).resolves.toEqual({
        defaultMethod: "preview",
        typeMap: { args: {} },
      });
      await expect(loadFrameworkOptionsFile("named.mjs", tempDir)).resolves.toMatchObject({
        defaultMethod: "named",
      });
      await expect(loadFrameworkOptionsFile(join(tempDir, "options.json"), tempDir)).resolves.toEqual({
        defaultMethod: "render",
        _configDir: "/tmp/config",
      });
    });

    it("rejects non-object exports", async () => {
      writeFileSync(join(tempDir, "bad.mjs"), "export default [];");

      await expect(loadFrameworkOptionsFile("bad.mjs", tempDir)).rejects.toThrow(
        "Framework options file must export an object",
      );
    });
  });

  describe("preview", () => {
    it("falls back to an empty args object for malformed story args", async () => {
      const { context } = makeContext(phpComponent);
      context.storyContext.args = undefined as unknown as Record<string, unknown>;
      const fetchMock = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ html: "<div>ok</div>" }),
      });
      vi.stubGlobal("fetch", fetchMock);

      await renderToCanvas(context, document.createElement("div"));

      expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
        componentId: "cmp_test",
        args: {},
      });
    });

    it("returns early when a request is aborted before reading JSON", async () => {
      const canvas = document.createElement("div");
      const first = makeContext(phpComponent);
      const second = makeContext(phpComponent);

      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockImplementationOnce((_url: string, options: RequestInit) => {
            const signal = options.signal as AbortSignal;
            return new Promise((resolve) => {
              signal.addEventListener("abort", () => {
                resolve({
                  json: () => Promise.resolve({ html: "<div>stale</div>" }),
                });
              });
            });
          })
          .mockResolvedValueOnce({
            json: () => Promise.resolve({ html: "<div>fresh</div>" }),
          }),
      );

      const firstRender = renderToCanvas(first.context, canvas);
      const secondRender = renderToCanvas(second.context, canvas);

      await Promise.all([firstRender, secondRender]);

      expect(canvas.innerHTML).toBe("<div><div>fresh</div></div>");
      expect(first.showError).not.toHaveBeenCalled();
    });

    it("returns early when a request is aborted after JSON resolves", async () => {
      const canvas = document.createElement("div");
      const first = makeContext(phpComponent);
      const second = makeContext(phpComponent);
      let resolveJson: ((value: { html: string }) => void) | undefined;

      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValueOnce({
            json: () =>
              new Promise((innerResolve) => {
                resolveJson = innerResolve;
              }),
          })
          .mockResolvedValueOnce({
            json: () => Promise.resolve({ html: "<div>fresher</div>" }),
          }),
      );

      const firstRender = renderToCanvas(first.context, canvas);
      await Promise.resolve();
      const secondRender = renderToCanvas(second.context, canvas);
      resolveJson?.({ html: "<div>stale</div>" });

      await Promise.all([firstRender, secondRender]);

      expect(canvas.innerHTML).toBe("<div><div>fresher</div></div>");
      expect(first.showError).not.toHaveBeenCalled();
    });

    it("returns early when the response object arrives after abort", async () => {
      const canvas = document.createElement("div");
      const first = makeContext(phpComponent);
      const second = makeContext(phpComponent);

      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockImplementationOnce((_url: string, options: RequestInit) => {
            const signal = options.signal as AbortSignal;
            return Promise.resolve({
              json: () => Promise.resolve({ html: "<div>stale</div>" }),
            });
          })
          .mockResolvedValueOnce({
            json: () => Promise.resolve({ html: "<div>freshest</div>" }),
          }),
      );

      const firstRender = renderToCanvas(first.context, canvas);
      const secondRender = renderToCanvas(second.context, canvas);

      await Promise.all([firstRender, secondRender]);

      expect(canvas.innerHTML).toBe("<div><div>freshest</div></div>");
      expect(first.showError).not.toHaveBeenCalled();
    });

    it("shows trace-less PHP errors and string-thrown failures", async () => {
      const errorCtx = makeContext(phpComponent);
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          json: () => Promise.resolve({ html: "", error: "Broken render" }),
        }),
      );

      await renderToCanvas(errorCtx.context, document.createElement("div"));

      expect(errorCtx.showError).toHaveBeenCalledWith({
        title: "PHP Render Error",
        description: "Broken render",
      });

      const thrownCtx = makeContext(phpComponent);
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue("Network down"));

      await renderToCanvas(thrownCtx.context, document.createElement("div"));

      expect(thrownCtx.showError).toHaveBeenCalledWith({
        title: "PHP Render Error",
        description: "Network down",
      });
      expect(previewParameters.renderer).toBe("storybook-php");
    });
  });

  describe("preset", () => {
    it("falls back to empty framework options when presets.apply returns undefined", async () => {
      const config = await viteFinal(
        { plugins: [] },
        {
          configDir: tempDir,
          presets: {
            apply: vi.fn().mockResolvedValue(undefined),
          },
        },
      );

      expect(core.renderer).toBe("storybook-php");
      expect(config.plugins).toHaveLength(1);
    });
  });

  describe("render-request and registry", () => {
    it("throws when component ids are used without a registry", () => {
      expect(() =>
        resolveExecutionRequest({ componentId: "missing", args: {} }, undefined),
      ).toThrowError(new RequestValidationError("Component registry is not available."));
    });

    it("throws for unknown component ids and returns null for missing registry entries", () => {
      const registry = new RenderRegistry();

      expect(registry.get("missing")).toBeNull();
      expect(() =>
        resolveExecutionRequest({ componentId: "missing", args: {} }, registry),
      ).toThrowError(new RequestValidationError("Unknown componentId: missing"));
    });

    it("normalizes missing adapters from registry plans to null", () => {
      const registry = new RenderRegistry();
      const componentId = registry.register({
        type: "template",
        file: "/tmp/view.php",
        sourceFile: "/tmp/view.php",
        class: null,
        callable: null,
      });

      expect(resolveExecutionRequest({ componentId, args: {} }, registry).adapter).toBeNull();
    });
  });

  describe("ts-plugin entrypoint", () => {
    it("patches the host and filters PHP import diagnostics", () => {
      const pluginModule = initTsPlugin({ typescript: ts });
      const host: ts.LanguageServiceHost = {
        fileExists: vi.fn((fileName) => fileName === "/fallback.ts"),
        readFile: vi.fn((fileName) => (fileName === "/fallback.ts" ? "fallback" : undefined)),
        getScriptSnapshot: vi.fn((fileName) =>
          fileName === "/fallback.ts" ? ts.ScriptSnapshot.fromString("fallback") : undefined,
        ),
      };
      const diagnostics: ts.Diagnostic[] = [
        { code: 2307, messageText: "Cannot find './SimpleComponent.php'" } as ts.Diagnostic,
        {
          code: 2792,
          messageText: { messageText: "Cannot find './SimpleComponent.php@render'" },
        } as unknown as ts.Diagnostic,
        { code: 2307, messageText: "Cannot find './Component.ts'" } as ts.Diagnostic,
        { code: 9999, messageText: "Other diagnostic" } as ts.Diagnostic,
      ];
      const languageService = {
        getSemanticDiagnostics: vi.fn(() => diagnostics),
        getCompletionsAtPosition: vi.fn(() => "copied"),
        label: "not-a-function",
      } as unknown as ts.LanguageService;

      const proxy = pluginModule.create({
        languageServiceHost: host,
        languageService,
      } as ts.server.PluginCreateInfo);

      const virtualPath = `${fixturePath("SimpleComponent.php")}@render.d.ts`;

      expect(pluginModule.getExternalFiles({} as ts.server.Project)).toEqual([]);
      expect(host.fileExists?.(virtualPath)).toBe(true);
      expect(host.fileExists?.("/fallback.ts")).toBe(true);
      expect(host.readFile?.(virtualPath)).toContain("SimpleComponent_render_Args");
      expect(host.readFile?.("/fallback.ts")).toBe("fallback");
      expect(host.getScriptSnapshot?.(virtualPath)?.getText(0, 24)).toContain("import type");
      expect(host.getScriptSnapshot?.("/fallback.ts")?.getText(0, 8)).toBe("fallback");
      expect(host.getScriptVersion?.(virtualPath)).toBeTruthy();
      expect(host.getScriptVersion?.("/fallback.ts")).toBe("0");
      expect(proxy.getSemanticDiagnostics("story.ts")).toEqual([diagnostics[2], diagnostics[3]]);
      expect((proxy as unknown as { getCompletionsAtPosition: () => string }).getCompletionsAtPosition()).toBe(
        "copied",
      );
    });

    it("falls back to direct filesystem reads when fileExists is not provided", () => {
      const pluginModule = initTsPlugin({ typescript: ts });
      const host: ts.LanguageServiceHost = {};

      pluginModule.create({
        config: { defaultMethod: "render" },
        languageServiceHost: host,
        languageService: {
          getSemanticDiagnostics: () => [],
        } as unknown as ts.LanguageService,
      } as ts.server.PluginCreateInfo);

      expect(host.fileExists?.(fixturePath("SimpleComponent.php"))).toBe(true);
      expect(host.fileExists?.("/definitely/missing.ts")).toBe(false);
    });
  });
});

function fixturePath(name: string): string {
  return resolve(FIXTURES, name);
}
