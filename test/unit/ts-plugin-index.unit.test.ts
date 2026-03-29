import { describe, expect, it, vi } from "vite-plus/test";
import { resolve } from "node:path";
import ts from "typescript";
import initTsPlugin from "../../src/ts-plugin/index.js";

function fixturePath(name: string): string {
  return resolve(import.meta.dirname!, "../fixtures", name);
}

describe("ts-plugin index", () => {
  it("patches the host and filters PHP import diagnostics", () => {
    const pluginModule = initTsPlugin({ typescript: ts });
    const host = {
      fileExists: vi.fn((fileName) => fileName === "/fallback.ts"),
      readFile: vi.fn((fileName) => (fileName === "/fallback.ts" ? "fallback" : undefined)),
      getScriptSnapshot: vi.fn((fileName) =>
        fileName === "/fallback.ts" ? ts.ScriptSnapshot.fromString("fallback") : undefined,
      ),
    } as unknown as ts.LanguageServiceHost;
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

    expect(
      pluginModule.getExternalFiles?.({} as ts.server.Project, 0 as ts.ProgramUpdateLevel),
    ).toEqual([]);
    expect(host.fileExists?.(virtualPath)).toBe(true);
    expect(host.fileExists?.("/fallback.ts")).toBe(true);
    expect(host.readFile?.(virtualPath)).toContain("SimpleComponent_render_Args");
    expect(host.readFile?.("/fallback.ts")).toBe("fallback");
    expect(host.getScriptSnapshot?.(virtualPath)?.getText(0, 24)).toContain("import type");
    expect(host.getScriptSnapshot?.("/fallback.ts")?.getText(0, 8)).toBe("fallback");
    expect(host.getScriptVersion?.(virtualPath)).toBeTruthy();
    expect(host.getScriptVersion?.("/fallback.ts")).toBe("0");
    expect(proxy.getSemanticDiagnostics("story.ts")).toEqual([diagnostics[2], diagnostics[3]]);
    expect(
      (proxy as unknown as { getCompletionsAtPosition: () => string }).getCompletionsAtPosition(),
    ).toBe("copied");
  });

  it("falls back to direct filesystem reads when fileExists is not provided", () => {
    const pluginModule = initTsPlugin({ typescript: ts });
    const host = {} as ts.LanguageServiceHost;

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
