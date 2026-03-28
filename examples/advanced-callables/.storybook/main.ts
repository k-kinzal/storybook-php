import type { StorybookConfig } from "storybook";

const config: StorybookConfig = {
  addons: ["@storybook/addon-vitest"],
  stories: ["../src/**/*.stories.ts"],
  framework: {
    name: "storybook-php",
    options: {
      bootstrap: new URL("../bootstrap.php", import.meta.url).pathname,
      timeout: 5000,
    },
  },
};

export default config;
