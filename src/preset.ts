import type { FrameworkOptions } from "./types.js";

interface PresetInterface {
  apply<T>(hook: string, defaultVal?: T, options?: unknown): Promise<T>;
}

interface StorybookOptions {
  presets: PresetInterface;
  [key: string]: unknown;
}

export const core = {
  builder: "@storybook/builder-vite",
  // renderer is 'storybook-php' — SB10 auto-loads storybook-php/preview
  renderer: "storybook-php",
};

export async function viteFinal(
  config: Record<string, unknown>,
  options: StorybookOptions,
): Promise<Record<string, unknown>> {
  const { storybookPhpPlugin } = await import("./vite-plugin.js");

  // SB10: framework options are accessed via the presets API
  const frameworkOptions: FrameworkOptions =
    (await options.presets.apply<FrameworkOptions>("frameworkOptions", {} as FrameworkOptions)) ??
    {};

  const existingPlugins = (config.plugins as unknown[] | undefined) ?? [];

  return {
    ...config,
    plugins: [...existingPlugins, storybookPhpPlugin(frameworkOptions)],
  };
}
