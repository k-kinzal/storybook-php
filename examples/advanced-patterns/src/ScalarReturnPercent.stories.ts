import type { Meta, StoryObj } from "storybook-php";
import { ScalarReturn } from "./ScalarReturn.php@renderPercent";

const meta: Meta<typeof ScalarReturn> = {
  component: ScalarReturn,
  title: "Components/ScalarReturn/Percent",
  argTypes: {
    current: { control: { type: "number", min: 0, max: 200 } },
    total: { control: { type: "number", min: 1, max: 200 } },
  },
};

export default meta;
type Story = StoryObj<typeof ScalarReturn>;

export const Half: Story = {
  args: { current: 50, total: 100 },
};

export const Overflow: Story = {
  args: { current: 150, total: 100 },
};
