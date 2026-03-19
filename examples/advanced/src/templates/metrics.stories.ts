import type { Meta, StoryObj } from "storybook-php";
import MetricsTemplate from "../templates/metrics.php";

const meta: Meta = {
  component: MetricsTemplate,
  title: "Templates/Metrics",
  argTypes: {
    title: { control: "text" },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    title: "Dashboard Overview",
    metrics: [
      { label: "Users", value: "12,458", trend: "+12%" },
      { label: "Revenue", value: "$84.2K", trend: "+8.3%" },
      { label: "Orders", value: "1,234", trend: "-2.1%" },
      { label: "Conversion", value: "3.6%", trend: "+0.5%" },
    ],
  },
};

export const Minimal: Story = {
  args: {
    title: "Server Stats",
    metrics: [
      { label: "Uptime", value: "99.9%" },
      { label: "Requests", value: "2.4M" },
    ],
  },
};
