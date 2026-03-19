import type { Meta, StoryObj } from "storybook-php";
import { ItemCollection } from "./ItemCollection.php@render";

const meta: Meta<typeof ItemCollection> = {
  component: ItemCollection,
  title: "Components/ItemCollection",
  argTypes: {
    name: { control: "text", description: "Collection name" },
    items: { control: "object", description: "List of items" },
    variant: { control: { type: "select", options: ["default", "compact"] } },
  },
};

export default meta;
type Story = StoryObj<typeof ItemCollection>;

export const Default: Story = {
  args: { name: "Frameworks", items: ["Laravel", "Symfony", "CodeIgniter"] },
};

export const Empty: Story = {
  args: { name: "Empty List", items: [] },
};

export const Compact: Story = {
  args: { name: "Tags", items: ["php", "storybook", "vite"], variant: "compact" },
};
