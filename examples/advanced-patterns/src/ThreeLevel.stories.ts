import type { Meta, StoryObj } from "storybook-php";
import { InteractiveButton } from "./ThreeLevel.php@render";

const meta: Meta<typeof InteractiveButton> = {
  component: InteractiveButton,
  title: "Patterns/DeepInheritance/InteractiveButton",
  argTypes: {
    text: { control: "text" },
    color: { control: "color" },
    background: { control: "color" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof InteractiveButton>;

export const Default: Story = {
  args: { text: "Click Me", background: "#3b82f6" },
};

export const Small: Story = {
  args: { text: "Small", size: "sm", background: "#22c55e" },
};

export const Large: Story = {
  args: { text: "Get Started", size: "lg", background: "#8b5cf6" },
};

export const Disabled: Story = {
  args: { text: "Disabled", disabled: true, background: "#6b7280" },
};
