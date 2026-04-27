import type { StorybookConfig } from "storybook";

const config: StorybookConfig = {
  addons: ["@storybook/addon-vitest"],
  stories: ["../src/**/*.stories.ts"],
  framework: {
    name: "storybook-php",
    options: {
      bootstrap: new URL("../bootstrap.php", import.meta.url).pathname,
      timeout: 5000,
      phpOptions: ["-d", "memory_limit=256M"],
      phpEnv: {
        APP_ENV: "storybook",
        XDEBUG_MODE: "off",
      },
    },
  },
};

export default config;
