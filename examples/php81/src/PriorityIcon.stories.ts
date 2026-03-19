import type { Meta, StoryObj } from "storybook-php";
import { Priority } from "./Priority.php@icon";

const meta: Meta<typeof Priority> = {
  component: Priority,
  title: "Enums/PriorityIcon",
  argTypes: {
    _case: { control: "select", options: [1, 2, 3, 4] },
  },
};

export default meta;
type Story = StoryObj<typeof Priority>;

export const Low: Story = {
  args: { _case: 1 },
};

export const Critical: Story = {
  args: { _case: 4 },
};
