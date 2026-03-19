import type { Meta, StoryObj } from "storybook-php";
import template from "./team.php";

const meta: Meta<typeof template> = {
  component: template,
  title: "Templates/Team",
  argTypes: {
    title: { control: "text" },
    columns: { control: { type: "number", min: 1, max: 4 } },
    showStatus: { control: "boolean" },
    variant: { control: "select", options: ["card", "list"] },
  },
};

export default meta;
type Story = StoryObj<typeof template>;

export const CardGrid: Story = {
  args: {
    title: "Engineering Team",
    columns: 2,
    showStatus: true,
    variant: "card",
    members: [
      { name: "Alice Chen", role: "Engineer", status: "active" },
      { name: "Bob Park", role: "Designer", status: "active" },
      { name: "Charlie Kim", role: "PM", status: "away" },
      { name: "Diana Lee", role: "Engineer", status: "offline" },
    ],
  },
};

export const ListView: Story = {
  args: {
    title: "Design Team",
    columns: 1,
    showStatus: true,
    variant: "list",
    members: [
      { name: "Eva Green", role: "Designer", status: "active" },
      { name: "Frank Wu", role: "Designer", status: "active" },
      { name: "Grace Hopper", role: "Engineer", status: "away" },
    ],
  },
};

export const ThreeColumns: Story = {
  args: {
    title: "Full Stack Team",
    columns: 3,
    showStatus: false,
    variant: "card",
    members: [
      { name: "Alice", role: "Engineer", status: "active" },
      { name: "Bob", role: "Designer", status: "active" },
      { name: "Charlie", role: "PM", status: "away" },
      { name: "Diana", role: "Engineer", status: "active" },
      { name: "Eve", role: "Designer", status: "offline" },
      { name: "Frank", role: "PM", status: "active" },
    ],
  },
};
