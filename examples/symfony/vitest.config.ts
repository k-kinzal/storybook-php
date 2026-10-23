import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { storybookVis } from "storybook-addon-vis/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
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
      provider: playwright({
        launchOptions: {
          args: [
            "--font-render-hinting=none",
            "--disable-font-subpixel-positioning",
            "--disable-lcd-text",
            "--force-color-profile=srgb",
          ],
        },
        contextOptions: {
          deviceScaleFactor: 2,
          viewport: { width: 960, height: 720 },
        },
      }),
      instances: [{ browser: "chromium" }],
    },
    setupFiles: ["./vitest.setup.ts"],
  },
});
