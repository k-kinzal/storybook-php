import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import { searchForWorkspaceRoot } from "vite";

const addonVitestDir = dirname(
  fileURLToPath(import.meta.resolve("@storybook/addon-vitest/package.json")),
);

export default defineConfig({
  plugins: [storybookTest({ configDir: resolve(process.cwd(), ".storybook") })],
  server: {
    fs: {
      // In pure npx/npm-exec environments, addon-vitest may live outside the
      // project root under npm's cache. Allow Vite's browser server to serve
      // the addon setup file from that resolved package directory.
      allow: [searchForWorkspaceRoot(process.cwd()), addonVitestDir],
    },
  },
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
