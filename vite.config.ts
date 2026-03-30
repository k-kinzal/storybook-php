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
    environment: "node",
    globals: true,
    testTimeout: 15000,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["test/unit/**/*.unit.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["test/integration/**/*.integration.test.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      // Supported by Vitest at runtime; vite-plus' config typing does not expose it yet.
      // @ts-expect-error coverage.all is valid in the underlying Vitest config
      all: true,
      include: ["src/**/*.ts"],
      exclude: ["src/cli.ts", "src/index.ts", "src/public-types.ts", "src/types.ts"],
      reporter: ["text", "json-summary", "clover"],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
  staged: {
    "*.{js,cjs,mjs,ts,cts,mts,json,md}": "vp check --fix",
  },
});
