import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { storybookVis } from "storybook-addon-vis/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [storybookTest({ configDir: ".storybook" }), storybookVis({ comparisonMethod: "pixel" })],
  optimizeDeps: {
    include: ["storybook-addon-vis/vitest-setup"],
  },
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
    setupFiles: ["./vitest.setup.ts"],
  },
});
