import { describe, it, expect } from "vite-plus/test";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";

describe("source layering", () => {
  it("keeps only package entrypoints and shared contracts at the src root", () => {
    const srcRoot = resolve(__dirname, "..");
    const rootFiles = readdirSync(srcRoot, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
      .map((entry) => entry.name)
      .sort();

    expect(rootFiles).toEqual([
      "cli.ts",
      "index.ts",
      "preset.ts",
      "preview.ts",
      "public-types.ts",
      "types.ts",
      "vite-plugin.ts",
    ]);
  });
});
