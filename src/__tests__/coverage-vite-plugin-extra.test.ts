import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { resolve } from "node:path";

const FIXTURES = resolve(__dirname, "fixtures");

describe("vite-plugin coverage extras", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("invokes the registered PHP middleware wrapper", async () => {
    const middleware = vi.fn(async () => undefined);
    vi.doMock("../runtime/server/dev-middleware.js", () => ({
      createPhpMiddleware: vi.fn(() => middleware),
    }));

    const { storybookPhpPlugin } = await import("../vite-plugin.js");
    const plugin = storybookPhpPlugin();
    const configureServer = (
      plugin as unknown as {
        configureServer(server: { middlewares: { use(fn: unknown): void } }): void;
      }
    ).configureServer.bind(plugin);

    let registered:
      | ((req: unknown, res: unknown, next: () => void) => Promise<void> | void)
      | undefined;
    configureServer({
      middlewares: {
        use(fn) {
          registered = fn as typeof registered;
        },
      },
    });

    const next = vi.fn();
    await registered?.({ url: "/__storybook_php/render", method: "POST" }, {}, next);

    expect(middleware).toHaveBeenCalledWith(
      { url: "/__storybook_php/render", method: "POST" },
      {},
      next,
    );
  });

  it("passes bootstrap, adapter, typeMap, and adapterMap into the middleware options", async () => {
    const createPhpMiddleware = vi.fn(() => vi.fn(async () => undefined));
    vi.doMock("../runtime/server/dev-middleware.js", () => ({
      createPhpMiddleware,
    }));

    const { storybookPhpPlugin } = await import("../vite-plugin.js");
    const plugin = storybookPhpPlugin({
      _configDir: FIXTURES,
      bootstrap: "Bootstrap.php",
      adapter: "fixture-adapter.php",
      typeMap: {
        args: { "App\\Components\\SimpleComponent::$name": "string" },
        files: {
          "TemplateFile.php": { adapter: "fixture-adapter.php" },
        },
      },
    });

    (
      plugin as unknown as {
        configureServer(server: { middlewares: { use(fn: unknown): void } }): void;
      }
    ).configureServer({
      middlewares: {
        use() {},
      },
    });

    expect(createPhpMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({
        bootstrap: "Bootstrap.php",
        adapter: "fixture-adapter.php",
        phpBinary: "php",
        timeout: 5000,
        typeMap: {
          args: { "App\\Components\\SimpleComponent::$name": "string" },
          files: {
            "TemplateFile.php": { adapter: "fixture-adapter.php" },
          },
        },
        adapterMap: {
          files: {
            [fixturePath("TemplateFile.php")]: fixturePath("fixture-adapter.php"),
          },
          patterns: [],
        },
      }),
      expect.anything(),
    );
  });

  it("returns undefined when no virtual modules depend on the changed file", async () => {
    const { storybookPhpPlugin } = await import("../vite-plugin.js");
    const plugin = storybookPhpPlugin();
    const handleHotUpdate = (
      plugin as unknown as {
        handleHotUpdate(payload: {
          file: string;
          server: {
            moduleGraph: { idToModuleMap: Map<string, unknown>; invalidateModule(mod: unknown): void };
            ws: { send(payload: unknown): void };
          };
        }): unknown;
      }
    ).handleHotUpdate.bind(plugin);
    const server = {
      moduleGraph: {
        idToModuleMap: new Map<string, unknown>(),
        invalidateModule: vi.fn(),
      },
      ws: { send: vi.fn() },
    };

    expect(handleHotUpdate({ file: fixturePath("SimpleComponent.php"), server })).toBeUndefined();
    expect(server.ws.send).not.toHaveBeenCalled();
  });

  it("returns undefined when the virtual ids are known but not present in the module graph", async () => {
    const { storybookPhpPlugin, VIRTUAL_PREFIX } = await import("../vite-plugin.js");
    const plugin = storybookPhpPlugin();
    const load = (
      plugin as unknown as {
        load(id: string): string | null;
        handleHotUpdate(payload: {
          file: string;
          server: {
            moduleGraph: { idToModuleMap: Map<string, unknown>; invalidateModule(mod: unknown): void };
            ws: { send(payload: unknown): void };
          };
        }): unknown;
      }
    ).load.bind(plugin);
    const handleHotUpdate = (plugin as unknown as { handleHotUpdate: (payload: unknown) => unknown })
      .handleHotUpdate.bind(plugin);
    const file = fixturePath("SimpleComponent.php");
    load(`${VIRTUAL_PREFIX}${file}?callable=render`);

    const server = {
      moduleGraph: {
        idToModuleMap: new Map([["/unrelated.js", { id: "/unrelated.js" }]]),
        invalidateModule: vi.fn(),
      },
      ws: { send: vi.fn() },
    };

    expect(handleHotUpdate({ file, server })).toBeUndefined();
    expect(server.moduleGraph.invalidateModule).not.toHaveBeenCalled();
  });

  it("invalidates affected virtual modules and triggers a full reload", async () => {
    const { storybookPhpPlugin, VIRTUAL_PREFIX } = await import("../vite-plugin.js");
    const plugin = storybookPhpPlugin();
    const typedPlugin = plugin as unknown as {
      load(id: string): string | null;
      handleHotUpdate(payload: {
        file: string;
        server: {
          moduleGraph: {
            idToModuleMap: Map<string, { id: string }>;
            invalidateModule(mod: { id: string }): void;
          };
          ws: { send(payload: unknown): void };
        };
      }): unknown;
    };
    const file = fixturePath("SimpleComponent.php");
    const virtualId = `${VIRTUAL_PREFIX}${file}?callable=render`;
    typedPlugin.load(virtualId);

    const affectedModule = { id: virtualId };
    const server = {
      moduleGraph: {
        idToModuleMap: new Map([[virtualId, affectedModule]]),
        invalidateModule: vi.fn(),
      },
      ws: { send: vi.fn() },
    };

    expect(typedPlugin.handleHotUpdate({ file, server })).toEqual([]);
    expect(server.moduleGraph.invalidateModule).toHaveBeenCalledWith(affectedModule);
    expect(server.ws.send).toHaveBeenCalledWith({ type: "full-reload" });
  });

  it("ignores module-graph entries without ids and resolves queryless virtual ids", async () => {
    const { VIRTUAL_PREFIX, resolveAdapterMap, storybookPhpPlugin } = await import("../vite-plugin.js");
    const plugin = storybookPhpPlugin();
    const typedPlugin = plugin as unknown as {
      load(id: string): string | null;
      handleHotUpdate(payload: {
        file: string;
        server: {
          moduleGraph: {
            idToModuleMap: Map<string, { id?: string }>;
            invalidateModule(mod: { id?: string }): void;
          };
          ws: { send(payload: unknown): void };
        };
      }): unknown;
    };
    const file = fixturePath("TemplateFile.php");

    expect(typedPlugin.load(`${VIRTUAL_PREFIX}${file}`)).toContain("__type: 'template'");
    expect(
      resolveAdapterMap(
        {
          "TemplateFile.php": { adapter: "fixture-adapter.php" },
        },
        FIXTURES,
      ),
    ).toEqual({
      files: {
        [fixturePath("TemplateFile.php")]: fixturePath("fixture-adapter.php"),
      },
      patterns: [],
    });

    const server = {
      moduleGraph: {
        idToModuleMap: new Map([["missing-id", {}]]),
        invalidateModule: vi.fn(),
      },
      ws: { send: vi.fn() },
    };

    expect(typedPlugin.handleHotUpdate({ file, server })).toBeUndefined();
  });

  it("returns undefined when adapter maps are resolved without a config dir", async () => {
    const { resolveAdapterMap } = await import("../vite-plugin.js");

    expect(resolveAdapterMap(undefined, undefined)).toBeUndefined();
  });
});

function fixturePath(name: string): string {
  return resolve(FIXTURES, name);
}
