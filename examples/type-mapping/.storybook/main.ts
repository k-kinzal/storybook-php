import type { StorybookConfig } from "storybook";

/**
 * Component file and constructor contracts are configured under components.
 * Argument value objects use types for concrete routes and property contracts.
 * Story overrides use parameters.php.component.args and parameters.php.types.
 */
const config: StorybookConfig = {
  addons: ["@storybook/addon-vitest"],
  stories: ["../src/**/*.stories.ts"],
  framework: {
    name: "storybook-php",
    options: {
      bootstrap: new URL("../bootstrap.php", import.meta.url).pathname,
      timeout: 5000,

      components: {
        files: {
          // Cross-file inheritance: tell the vite-plugin to also parse
          // BaseCard.php so it can resolve the parent constructor params.
          "../src/InfoCard.php": {
            includes: ["../src/BaseCard.php"],
          },

          // Direct template import: this file is not PHP-parsed, so
          // we provide the full arg contract here.
          "../src/InlineCallout.view": {
            args: {
              title: "string",
              content: {
                type: "App\\Components\\Renderable",
                required: true,
              },
              featured: {
                type: "bool",
                default: false,
              },
              note: {
                type: "string",
                nullable: true,
              },
            },
          },

          // phpFile redirect: importing button.bridge reuses Button.php's
          // signature and runtime plan while keeping the source import stable.
          "../src/button.bridge": {
            phpFile: "../src/Button.php",
            callable: "render",
          },
          "../src/Button.php": {
            args: {
              variant: {
                options: ["default", "primary", "danger", "outline"],
              },
            },
          },
          "../src/Status.php": {
            args: {
              _case: {
                options: ["active", "inactive", "pending", "archived"],
              },
            },
          },
          "../src/TagList.php": {
            args: {
              tags: {
                elementType: "string",
              },
            },
          },
          "../src/UntypedBlock.php": {
            args: {
              content: "App\\Components\\HtmlBlock",
            },
          },
          "../src/DefaultNotice.php": {
            args: {
              limit: {
                type: "int",
                default: 3,
              },
              subtitle: {
                type: "string",
                nullable: true,
              },
            },
          },
        },
        classes: {
          "App\\Components\\NavMenu": {
            args: { sections: "NavSection[]" },
          },
        },
      },
      types: {
        "App\\Components\\Renderable": "App\\Components\\HtmlBlock",
        "App\\Components\\NavSection::$links": "list<App\\Components\\NavLink>",
      },
    },
  },
};

export default config;
