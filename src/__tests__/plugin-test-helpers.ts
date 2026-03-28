import type { Plugin } from "vite";
import { storybookPhpPlugin } from "../vite-plugin.js";

type StorybookPhpPluginInstance = ReturnType<typeof storybookPhpPlugin>;
type ResolveIdHook = (source: string, importer?: string) => string | null;
type RawLoadHook = (id: string) => string | null;
type LoadHook = (id: string | null) => string | null;
type ConfigureServerHook = (server: {
  middlewares: {
    use: (middleware: unknown) => void;
  };
}) => void;

type StorybookPhpTestPlugin = Plugin & {
  resolveId: ResolveIdHook;
  load: RawLoadHook;
  configureServer?: ConfigureServerHook;
};

function asTestPlugin(plugin: StorybookPhpPluginInstance): StorybookPhpTestPlugin {
  return plugin as StorybookPhpTestPlugin;
}

export function getResolveId(plugin: StorybookPhpPluginInstance): ResolveIdHook {
  return asTestPlugin(plugin).resolveId.bind(plugin);
}

export function getLoad(plugin: StorybookPhpPluginInstance): LoadHook {
  const load = asTestPlugin(plugin).load.bind(plugin);
  return (id) => {
    if (id === null) {
      return null;
    }

    return load(id);
  };
}

export function getConfigureServer(
  plugin: StorybookPhpPluginInstance,
): NonNullable<StorybookPhpTestPlugin["configureServer"]> {
  const configureServer = asTestPlugin(plugin).configureServer;
  if (!configureServer) {
    throw new Error("configureServer hook is missing");
  }

  return configureServer.bind(plugin);
}
