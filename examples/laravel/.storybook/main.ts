import type { StorybookConfig } from "storybook";

const config: StorybookConfig = {
  addons: ["@storybook/addon-vitest"],
  stories: ["../src/**/*.stories.ts"],
  framework: {
    name: "storybook-php",
    options: {
      bootstrap: new URL("../bootstrap.php", import.meta.url).pathname,
      adapter: new URL("../adapter.php", import.meta.url).pathname,
      timeout: 10000,
    },
  },
};

export default config;
