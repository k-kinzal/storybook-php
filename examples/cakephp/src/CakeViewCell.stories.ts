import type { Meta, StoryObj } from "storybook-php";
import { CakeViewCell } from "./CakeViewCell.php@render";

const meta: Meta<typeof CakeViewCell> = {
  component: CakeViewCell,
  title: "CakePHP/CakeViewCell",
  argTypes: {
    period: { control: "select", options: ["daily", "weekly", "monthly", "yearly"] },
  },
};

export default meta;
type Story = StoryObj<typeof CakeViewCell>;

export const Monthly: Story = {
  args: { period: "monthly", userCount: 1250, orderCount: 340, revenue: "$12,500" },
};

export const Daily: Story = {
  args: { period: "daily", userCount: 42, orderCount: 15, revenue: "$450" },
};

export const Yearly: Story = {
  args: { period: "yearly", userCount: 15000, orderCount: 4200, revenue: "$150,000" },
};
