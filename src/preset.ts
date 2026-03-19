import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
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

export function previewAnnotations(
  entries: (string | { bare: string; absolute: string })[] = [],
): (string | { bare: string; absolute: string })[] {
  const __filename = fileURLToPath(import.meta.url);
  const previewPath = resolve(dirname(__filename), "preview.mjs");
  return [...entries, { bare: "storybook-php/preview", absolute: previewPath }];
}

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
