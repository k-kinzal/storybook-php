import type { Meta, StoryObj } from "storybook-php";
import { LatteStats } from "./LatteStats.php@render";

const meta: Meta<typeof LatteStats> = {
  component: LatteStats,
  title: "Nette/LatteStats",
  argTypes: {
    color: { control: "color" },
  },
};

export default meta;
type Story = StoryObj<typeof LatteStats>;

export const Default: Story = {
  args: {
    items: [
      { label: "Users", value: "1,234" },
      { label: "Revenue", value: "$56K" },
      { label: "Orders", value: "890" },
    ],
  },
};

export const CustomColor: Story = {
  args: {
    items: [
      { label: "CPU", value: "42%" },
      { label: "Memory", value: "68%" },
      { label: "Disk", value: "23%" },
    ],
    color: "#10b981",
  },
};
