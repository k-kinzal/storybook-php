import type { Plugin, ViteDevServer } from "vite";
import { loadComponentSchemas } from "./core/component/component-schema.js";
import { generateVirtualModule } from "./core/component/module-emitter.js";
import {
  resolveFrameworkOptions,
  resolveImportSource,
  VIRTUAL_PREFIX,
  type ResolvedFrameworkOptions,
} from "./core/config/framework-config.js";
import { createPhpMiddleware } from "./runtime/server/dev-middleware.js";
import { RenderRegistry } from "./runtime/render/render-registry.js";
import type { AdapterMap, FileMapTarget, FrameworkOptions } from "./types.js";

export function storybookPhpPlugin(options: FrameworkOptions = {}): Plugin {
  const resolvedOptions = resolveFrameworkOptions(options);
  const registry = new RenderRegistry();
  const virtualModuleDependencies = new Map<string, string[]>();

  return {
    name: "storybook-php",
    enforce: "pre",

    resolveId(source: string, importer: string | undefined) {
      const resolved = resolveImportSource(source, importer, resolvedOptions);
      if (!resolved) {
        return null;
      }

      return `${VIRTUAL_PREFIX}${resolved.sourceFile}?callable=${resolved.callableName ?? ""}${
        resolved.mapped ? "&mapped=1" : ""
      }`;
    },

    load(id: string) {
      if (!id.startsWith(VIRTUAL_PREFIX)) return null;

      const { sourceFile, callableName } = parseVirtualId(id);
      const result = loadComponentSchemas(sourceFile, callableName, resolvedOptions);

      virtualModuleDependencies.set(id, result.dependencies);

      const registeredSchemas = result.schemas.map((schema) => ({
        ...schema,
        componentId: registry.register(
          schema.renderPlan,
          schema.publicArgs,
          schema.constructorArgs,
          schema.callableArgs,
        ),
      }));

      return generateVirtualModule(registeredSchemas, result.error);
    },

    configureServer(server: ViteDevServer) {
      const executorOptions = {
        phpBinary: resolvedOptions.phpBinary,
        timeout: resolvedOptions.timeout,
        ...(resolvedOptions.bootstrap !== null ? { bootstrap: resolvedOptions.bootstrap } : {}),
        ...(resolvedOptions.adapter !== null ? { adapter: resolvedOptions.adapter } : {}),
        ...(options.typeMap !== undefined ? { typeMap: options.typeMap } : {}),
        ...(resolvedOptions.adapterMap ? { adapterMap: resolvedOptions.adapterMap } : {}),
      };

      const middleware = createPhpMiddleware(executorOptions, registry);

      server.middlewares.use((req, res, next) => {
        void middleware(req, res, next);
      });
    },

    handleHotUpdate({ file, server }) {
      const affectedVirtualIds = [...virtualModuleDependencies.entries()]
        .filter(([, dependencies]) => dependencies.includes(file))
        .map(([id]) => id);

      if (affectedVirtualIds.length === 0) {
        return undefined;
      }

      const affectedModules = [...server.moduleGraph.idToModuleMap.values()].filter((mod) =>
        affectedVirtualIds.includes(mod.id ?? ""),
      );

      if (affectedModules.length === 0) {
        return undefined;
      }

      affectedModules.forEach((mod) => server.moduleGraph.invalidateModule(mod));
      server.ws.send({ type: "full-reload" });
      return [];
    },
  };
}

export function resolveAdapterMap(
  fileMap: Record<string, FileMapTarget> | undefined,
  configDir: string | undefined,
): AdapterMap | undefined {
  const options: FrameworkOptions = {};
  if (configDir !== undefined) options._configDir = configDir;
  if (fileMap !== undefined) options.typeMap = { files: fileMap };
  const resolved = resolveFrameworkOptions(options);

  return resolved.adapterMap ?? undefined;
}

function parseVirtualId(id: string): { sourceFile: string; callableName: string | null } {
  const rest = id.slice(VIRTUAL_PREFIX.length);
  const queryIndex = rest.indexOf("?");
  const sourceFile = queryIndex === -1 ? rest : rest.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : rest.slice(queryIndex + 1);
  const params = new URLSearchParams(query);

  return {
    sourceFile,
    callableName: params.get("callable") || null,
  };
}

export { VIRTUAL_PREFIX };
export type { ResolvedFrameworkOptions };
