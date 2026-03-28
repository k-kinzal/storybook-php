import type { Meta, StoryObj } from "storybook-php";
import { StatsCard } from "./ArrayReturn.php@render";

const meta: Meta<typeof StatsCard> = {
  component: StatsCard,
  title: "Components/StatsCard",
  argTypes: {
    label: { control: "text" },
    value: { control: "number" },
    unit: { control: "text" },
    change: { control: { type: "number", step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof StatsCard>;

export const Revenue: Story = {
  args: { label: "Revenue", value: 12450, unit: "USD", change: 12.5 },
};

export const Users: Story = {
  args: { label: "Active Users", value: 1284, change: -3.2 },
};

export const Uptime: Story = {
  args: { label: "Uptime", value: 99.9, unit: "%" },
};
