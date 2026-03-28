import type { Meta, StoryObj } from "storybook-php";
import { Table } from "./Table.php@render";

const meta: Meta<typeof Table> = {
  component: Table,
  title: "Components/Table",
  argTypes: {
    striped: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  args: {
    headers: ["Name", "Role", "Status"],
    rows: [
      ["Alice", "Engineer", "Active"],
      ["Bob", "Designer", "Active"],
      ["Charlie", "Manager", "Away"],
    ],
  },
};

export const Striped: Story = {
  args: {
    headers: ["Product", "Price", "Stock"],
    rows: [
      ["Widget", "$9.99", "150"],
      ["Gadget", "$24.99", "42"],
      ["Doohickey", "$4.99", "500"],
    ],
    striped: true,
  },
};

export const SingleColumn: Story = {
  args: {
    headers: ["Item"],
    rows: [["First"], ["Second"], ["Third"]],
  },
};
