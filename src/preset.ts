import type { FrameworkOptions } from "./types.js";

interface PresetInterface {
  apply<T>(hook: string, defaultVal?: T, options?: unknown): Promise<T>;
}

interface StorybookOptions {
  presets: PresetInterface;
  configDir?: string;
  [key: string]: unknown;
}

interface ViteConfigLike extends Record<string, unknown> {
  plugins?: unknown[];
}

export const core = {
  builder: "@storybook/builder-vite",
  // renderer is 'storybook-php' — SB10 auto-loads storybook-php/preview
  renderer: "storybook-php",
};

export async function viteFinal(
  config: ViteConfigLike,
  options: StorybookOptions,
): Promise<ViteConfigLike> {
  const { storybookPhpPlugin } = await import("./vite-plugin.js");

  // SB10: framework options are accessed via the presets API
  const frameworkOptions: FrameworkOptions =
    (await options.presets.apply<FrameworkOptions>("frameworkOptions", {} as FrameworkOptions)) ??
    {};

  // Resolve config directory without mutating the preset payload object.
  const resolvedFrameworkOptions: FrameworkOptions = {
    ...frameworkOptions,
    _configDir: frameworkOptions._configDir ?? options.configDir ?? process.cwd(),
  };

  const existingPlugins = config.plugins ?? [];

  return {
    ...config,
    plugins: [...existingPlugins, storybookPhpPlugin(resolvedFrameworkOptions)],
  };
}
