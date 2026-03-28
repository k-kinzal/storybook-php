import type { Meta, StoryObj } from "storybook-php";
import { Circle } from "./AbstractShape.php@render";

const meta: Meta<typeof Circle> = {
  component: Circle,
  title: "Components/Shapes/Circle",
  argTypes: {
    color: { control: "color" },
    size: { control: { type: "range", min: 40, max: 200, step: 10 } },
  },
};

export default meta;
type Story = StoryObj<typeof Circle>;

export const Default: Story = {
  args: { color: "#3b82f6", size: 100 },
};

export const Small: Story = {
  args: { color: "#22c55e", size: 60 },
};

export const Large: Story = {
  args: { color: "#ef4444", size: 160 },
};
