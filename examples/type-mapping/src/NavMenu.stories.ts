/**
 * NavMenu runs its constructor with the components.classes contract.
 * NavSection and NavLink values are allocated through reflected properties;
 * types["App\\Components\\NavSection::$links"] supplies the nested list type.
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
        links: [{ label: "Framework Options", href: "#" }],
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
    php: {
      types: {
        "App\\Components\\NavLink::$href": { value: "/story" },
      },
    },
  },
};
