import type { Meta, StoryObj } from "storybook-php";
import { CakeStats } from "./CakeStats.php@render";

const meta: Meta<typeof CakeStats> = {
  component: CakeStats,
  title: "CakePHP/CakeStats",
  argTypes: {
    color: { control: "color" },
  },
};

export default meta;
type Story = StoryObj<typeof CakeStats>;

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
