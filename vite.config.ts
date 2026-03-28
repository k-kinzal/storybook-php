import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    ignorePatterns: ["dist/**", ".takt/**", "examples/**", "client.d.ts"],
    options: {
      typeAware: true,
      typeCheck: true,
      denyWarnings: true,
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  fmt: {
    ignorePatterns: ["dist/**", ".takt/**"],
  },
  pack: {
    entry: [
      "src/index.ts",
      "src/preset.ts",
      "src/preview.ts",
      "src/vite-plugin.ts",
      "src/cli.ts",
      "src/ts-plugin/index.ts",
    ],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    target: "node20",
    deps: { neverBundle: ["storybook", "vite", "typescript", "@storybook/builder-vite"] },
  },
  test: {
    include: ["src/__tests__/**/*.test.ts"],
    environment: "node",
    globals: true,
    testTimeout: 15000,
  },
  staged: {
    "*.{js,cjs,mjs,ts,cts,mts,json,md}": "vp check --fix",
  },
});
