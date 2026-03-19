import type { Meta, StoryObj } from "storybook-php";
import { Divider } from "./Divider.php@__invoke";

const meta: Meta<typeof Divider> = {
  component: Divider,
  title: "Components/Divider",
  argTypes: {
    style: { control: "select", options: ["solid", "dashed", "dotted", "double"] },
    color: { control: "color" },
    spacing: { control: { type: "number", min: 0, max: 64 } },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Solid: Story = {
  args: { style: "solid" },
};

export const Dashed: Story = {
  args: { style: "dashed", color: "#3b82f6" },
};

export const Labeled: Story = {
  args: { label: "OR", style: "solid", color: "#d1d5db" },
};
