import type { Meta, StoryObj } from "storybook-php";
import { StaticInstance } from "./StaticInstance.php@render";

const meta: Meta<typeof StaticInstance> = {
  component: StaticInstance,
  title: "Components/StaticInstance",
  argTypes: {
    content: { control: "text" },
    type: { control: "select", options: ["info", "success", "warning"] },
  },
};

export default meta;
type Story = StoryObj<typeof StaticInstance>;

export const Info: Story = {
  args: { content: "Instance method rendered card", type: "info" },
};

export const Success: Story = {
  args: { content: "Great job!", type: "success" },
};
