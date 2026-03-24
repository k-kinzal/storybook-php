import type { StorybookConfig } from "storybook";

/**
 * Type Mapping Example
 *
 * This example demonstrates all three sections of typeMap:
 *
 *   1. files   — Map file paths to type information sources
 *   2. bindings — DI-style type resolution (interface → concrete)
 *   3. args    — Override/supplement argument metadata (options, elementType, type)
 */
const config: StorybookConfig = {
  addons: ["@storybook/addon-vitest"],
  stories: ["../src/**/*.stories.ts"],
  framework: {
    name: "storybook-php",
    options: {
      bootstrap: new URL("../bootstrap.php", import.meta.url).pathname,
      timeout: 5000,

      typeMap: {
        // ---------------------------------------------------------------
        // files: Map file paths → type information sources
        // ---------------------------------------------------------------
        files: {
          // Cross-file inheritance: tell the vite-plugin to also parse
          // BaseCard.php so it can resolve the parent constructor params.
          "../src/InfoCard.php": {
            includes: ["../src/BaseCard.php"],
          },
        },

        // ---------------------------------------------------------------
        // bindings: Interface/Abstract → Concrete class (DI-style)
        // ---------------------------------------------------------------
        // When runner.php encounters a constructor param typed as Renderable,
        // it will instantiate HtmlBlock instead.
        bindings: {
          "App\\Components\\Renderable": "App\\Components\\HtmlBlock",
        },

        // ---------------------------------------------------------------
        // args: Override/supplement argument metadata
        // ---------------------------------------------------------------
        args: {
          // String option set: provide valid values for select control.
          // Without this, Storybook only sees `type: 'string'` and renders
          // a plain text input. With options, it renders a select dropdown.
          "App\\Components\\Button::$variant": {
            options: ["default", "primary", "danger", "outline"],
          },

          // Enum case values: provide backing values for the select control.
          // The parser extracts case names but not backing values.
          "App\\Components\\Status::$_case": {
            options: ["active", "inactive", "pending", "archived"],
          },

          // Array element type: tell the system what type each array
          // element should be, enabling proper casting at runtime.
          "App\\Components\\TagList::$tags": {
            elementType: "string",
          },
        },
      },
    },
  },
};

export default config;
