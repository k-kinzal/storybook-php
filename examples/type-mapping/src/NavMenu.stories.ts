/**
 * typeMap.classes demo: Constructor types for nested classes
 *
 * NavMenu takes `array $sections`, and each NavSection takes `array $links`.
 * Static analysis only sees `array`, so without help the runtime would pass
 * raw arrays down and NavSection / NavLink would never be instantiated.
 *
 * Config in main.ts:
 *   classes: {
 *     "App\\Components\\NavMenu": { args: { sections: "NavSection[]" } },
 *     "App\\Components\\NavSection": { args: { links: "NavLink[]" } },
 *   }
 */
import type { Meta, StoryObj } from "storybook-php";
import { NavMenu } from "./NavMenu.php@render";

const meta: Meta<typeof NavMenu> = {
  component: NavMenu,
  title: "Classes/NavMenu Nested Types",
};

export default meta;
type Story = StoryObj<typeof NavMenu>;

export const Default: Story = {
  args: {
    sections: [
      {
        title: "Guides",
        links: [
          { label: "Getting Started", href: "/guides/start" },
          { label: "Type Mapping", href: "/guides/type-mapping" },
        ],
      },
      {
        title: "Reference",
        links: [{ label: "Framework Options" }],
      },
    ],
  },
};

export const StoryLevelOverride: Story = {
  args: {
    sections: [
      {
        title: "Story override",
        links: [{ label: "Links default to /story" }],
      },
    ],
  },
  parameters: {
    typeMap: {
      classes: {
        "App\\Components\\NavLink": {
          args: { href: { type: "string", default: "/story" } },
        },
      },
    },
  },
};
