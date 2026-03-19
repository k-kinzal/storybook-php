import type { Meta, StoryObj } from "storybook-php";
import { OverrideTrait } from "./OverrideTrait.php@render";

const meta: Meta<typeof OverrideTrait> = {
  component: OverrideTrait,
  title: "Patterns/OverrideTrait",
  argTypes: {
    title: { control: "text" },
    variant: { control: "select", options: ["primary", "secondary", "success"] },
  },
};

export default meta;
type Story = StoryObj<typeof OverrideTrait>;

export const Primary: Story = {
  args: { title: "Custom Render", variant: "primary" },
};

export const Secondary: Story = {
  args: { title: "Fallback Style", variant: "secondary" },
};

export const Success: Story = {
  args: { title: "Completed", variant: "success" },
};
