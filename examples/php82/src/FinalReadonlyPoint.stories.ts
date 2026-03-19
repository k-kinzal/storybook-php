import type { Meta, StoryObj } from "storybook-php";
import { Point } from "./FinalReadonlyPoint.php@render";

const meta: Meta<typeof Point> = {
  component: Point,
  title: "PHP82/FinalReadonlyClass",
  argTypes: {
    x: { control: { type: "number", step: 0.1 } },
    y: { control: { type: "number", step: 0.1 } },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Point>;

export const Default: Story = {
  args: { x: 3.14, y: 2.71, label: "P1" },
};

export const NoLabel: Story = {
  args: { x: -1.5, y: 4.0 },
};
