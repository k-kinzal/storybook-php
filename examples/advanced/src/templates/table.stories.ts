import type { Meta, StoryObj } from "storybook-php";
import TableTemplate from "../templates/table.php";

const meta: Meta = {
  component: TableTemplate,
  title: "Templates/Table",
  argTypes: {
    caption: { control: "text" },
    striped: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    caption: "User List",
    headers: ["Name", "Email", "Role"],
    rows: [
      ["Alice", "alice@example.com", "Admin"],
      ["Bob", "bob@example.com", "Editor"],
      ["Charlie", "charlie@example.com", "Viewer"],
    ],
    striped: false,
  },
};

export const Striped: Story = {
  args: {
    caption: "Products",
    headers: ["ID", "Name", "Price"],
    rows: [
      [1, "Widget", "$9.99"],
      [2, "Gadget", "$19.99"],
      [3, "Doohickey", "$4.99"],
      [4, "Thingamajig", "$14.99"],
    ],
    striped: true,
  },
};

export const Empty: Story = {
  args: {
    caption: "No Data",
    headers: ["Column A", "Column B"],
    rows: [],
    striped: false,
  },
};
