import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { storybookVis } from "storybook-addon-vis/vitest-plugin";
import { defineConfig } from "vitest/config";

import { browserOptions, publicDir, screenshotDefines } from "../_shared/vrt-config.mjs";

export default defineConfig({
  publicDir,
  define: screenshotDefines,
  plugins: [
    storybookTest({ configDir: ".storybook" }),
    storybookVis({ comparisonMethod: "pixel" }),
  ],
  optimizeDeps: {
    include: ["storybook-addon-vis/vitest-setup"],
  },
  test: {
    browser: {
      api: {
        host: "127.0.0.1",
        // The visual comparator writes PNG diffs. Only ephemeral CI may write;
        // local Storybook/Vitest servers keep writes and execution disabled.
        allowWrite: process.env["GITHUB_ACTIONS"] === "true",
        allowExec: false,
      },
      enabled: true,
      ui: false,
      provider: playwright(browserOptions),
      instances: [{ browser: "chromium" }],
    },
    setupFiles: ["./vitest.setup.ts"],
  },
});
