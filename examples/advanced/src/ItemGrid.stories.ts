import type { Meta, StoryObj } from "storybook-php";
import { ItemGrid } from "./ItemGrid.php@render";

const meta: Meta<typeof ItemGrid> = {
  component: ItemGrid,
  title: "Components/ItemGrid",
  argTypes: {
    style: { control: "select", options: ["list", "grid"] },
  },
};

export default meta;
type Story = StoryObj<typeof ItemGrid>;

export const AsList: Story = {
  args: {
    title: "Frameworks",
    items: ["Laravel", "Symfony", "CakePHP", "Slim"],
    style: "list",
  },
};

export const AsGrid: Story = {
  args: {
    title: "Languages",
    items: ["PHP", "TypeScript", "Python", "Go", "Rust"],
    style: "grid",
  },
};

export const Empty: Story = {
  args: {
    title: "Nothing Here",
    items: [],
    emptyMessage: "The list is empty.",
  },
};
