import type { Meta, StoryObj } from "storybook-php";
import { statusCard } from "./funcHtmlArray.php@statusCard";

const meta: Meta<typeof statusCard> = {
  component: statusCard,
  title: "Functions/StatusCard",
  argTypes: {
    title: { control: "text" },
    status: { control: "select", options: ["active", "inactive", "pending"] },
    count: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof statusCard>;

export const Active: Story = {
  args: { title: "Users", status: "active", count: 128 },
};

export const Pending: Story = {
  args: { title: "Orders", status: "pending", count: 5 },
};

export const Inactive: Story = {
  args: { title: "Sessions", status: "inactive", count: 0 },
};
