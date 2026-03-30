import type { StorybookConfig } from "storybook";

/**
 * Type Mapping Example
 *
 * This example demonstrates all three sections of typeMap:
 *
 *   1. files   — Map file paths to type information sources
 *   2. bindings — DI-style type resolution (interface → concrete)
 *   3. args    — Override/supplement argument metadata (options, elementType, type)
 *
 * The stories in ../src cover:
 *   - options for string and enum controls
 *   - interface bindings
 *   - elementType for arrays
 *   - type overrides for untyped params
 *   - runtime defaults and nullable overrides
 *   - direct non-PHP template imports via files.args
 *   - phpFile redirects for non-PHP sources
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

          // Untyped constructor parameter: tell the runner which concrete
          // class to instantiate from Storybook args.
          "App\\Components\\UntypedBlock::$content": "App\\Components\\HtmlBlock",

          // Runtime defaults and nullable handling for parameters that
          // don't have native defaults in the PHP signature.
          "App\\Components\\DefaultNotice::$limit": {
            type: "int",
            default: 3,
          },
          "App\\Components\\DefaultNotice::$subtitle": {
            type: "string",
            nullable: true,
          },
        },
      },
    },
  },
};

export default config;
