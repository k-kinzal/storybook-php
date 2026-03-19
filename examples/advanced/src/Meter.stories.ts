import type { Meta, StoryObj } from "storybook-php";
import { Meter } from "./Meter.php@render";

const meta: Meta<typeof Meter> = {
  component: Meter,
  title: "Components/Meter",
  argTypes: {
    value: { control: { type: "number", min: 0, max: 100, step: 0.5 } },
    min: { control: "number" },
    max: { control: "number" },
    label: { control: "text" },
    color: { control: "color" },
  },
};

export default meta;
type Story = StoryObj<typeof Meter>;

export const Default: Story = {
  args: { value: 65 },
};

export const Low: Story = {
  args: { value: 15, label: "Battery" },
};

export const Full: Story = {
  args: { value: 100, label: "Progress", color: "#3b82f6" },
};

export const FloatValue: Story = {
  args: { value: 33.7, min: 0, max: 50, label: "Temperature" },
};
