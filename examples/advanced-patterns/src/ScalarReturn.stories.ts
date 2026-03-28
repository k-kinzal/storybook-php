import type { Meta, StoryObj } from "storybook-php";
import { ScalarReturn } from "./ScalarReturn.php@render";

const meta: Meta<typeof ScalarReturn> = {
  component: ScalarReturn,
  title: "Components/ScalarReturn",
  argTypes: {
    current: { control: { type: "number", min: 0, max: 200 } },
    total: { control: { type: "number", min: 1, max: 200 } },
  },
};

export default meta;
type Story = StoryObj<typeof ScalarReturn>;

export const Default: Story = {
  args: { current: 65, total: 100 },
};

export const Complete: Story = {
  args: { current: 100, total: 100 },
};

export const Empty: Story = {
  args: { current: 0, total: 100 },
};
