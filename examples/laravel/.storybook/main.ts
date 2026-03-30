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
      typeMap: {
        files: {
          "*.blade.php": {
            adapter: new URL("../blade.php", import.meta.url).pathname,
          },
          "../src/views/direct-template.blade.php": {
            args: {
              title: "string",
              message: {
                type: "string",
                default: "Hello from Blade!",
              },
            },
          },
        },
      },
    },
  },
};

export default config;
