import type { Meta, StoryObj } from "storybook-php";
import { SplitView } from "./SplitView.php@renderCompact";

const meta: Meta<typeof SplitView> = {
  component: SplitView,
  title: "Patterns/SplitView/Compact",
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    theme: { control: "select", options: ["light", "dark"] },
  },
};

export default meta;
type Story = StoryObj<typeof SplitView>;

export const Default: Story = {
  args: { title: "Compact View" },
};

export const WithDescription: Story = {
  args: { title: "Task Item", description: "Due tomorrow" },
};
