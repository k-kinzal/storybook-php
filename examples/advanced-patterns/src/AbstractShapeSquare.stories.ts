import type { Meta, StoryObj } from "storybook-php";
import { Square } from "./AbstractShape.php@render";

const meta: Meta<typeof Square> = {
  component: Square,
  title: "Components/Shapes/Square",
  argTypes: {
    color: { control: "color" },
    size: { control: { type: "range", min: 40, max: 200, step: 10 } },
    radius: { control: { type: "range", min: 0, max: 50, step: 2 } },
  },
};

export default meta;
type Story = StoryObj<typeof Square>;

export const Default: Story = {
  args: { color: "#8b5cf6", size: 100, radius: 0 },
};

export const Rounded: Story = {
  args: { color: "#f59e0b", size: 120, radius: 16 },
};
