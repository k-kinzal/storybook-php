import type { Meta, StoryObj } from "storybook-php";
import { CIParserDemo } from "./CIParserDemo.php@render";

const meta: Meta<typeof CIParserDemo> = {
  component: CIParserDemo,
  title: "CodeIgniter/CIParserDemo",
};

export default meta;
type Story = StoryObj<typeof CIParserDemo>;

export const Default: Story = {
  args: {
    heading: "Dashboard Stats",
    description: "Overview of key metrics",
  },
};

export const CustomMetrics: Story = {
  args: {
    heading: "Server Status",
    description: "Current infrastructure metrics",
    metrics: [
      { name: "CPU Usage", count: "45%", change: "-3%" },
      { name: "Memory", count: "8.2 GB", change: "+5%" },
      { name: "Uptime", count: "99.9%", change: "0%" },
    ],
  },
};
