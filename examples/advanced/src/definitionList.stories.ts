import type { Meta, StoryObj } from "storybook-php";
import { definitionList } from "./definitionList.php@definitionList";

const meta: Meta<typeof definitionList> = {
  component: definitionList,
  title: "Functions/DefinitionList",
  argTypes: {
    variant: { control: "select", options: ["default", "striped", "compact"] },
  },
};

export default meta;
type Story = StoryObj<typeof definitionList>;

export const Default: Story = {
  args: {
    items: { Name: "John Doe", Email: "john@example.com", Role: "Admin", Status: "Active" },
    variant: "default",
  },
};

export const Striped: Story = {
  args: {
    items: { CPU: "4 cores", Memory: "16 GB", Disk: "512 GB SSD", OS: "Linux" },
    variant: "striped",
  },
};

export const Compact: Story = {
  args: {
    items: { Version: "2.1.0", Build: "1234", Date: "2025-01-15" },
    variant: "compact",
  },
};
