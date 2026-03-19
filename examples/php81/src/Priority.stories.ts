import type { Meta, StoryObj } from "storybook-php";
import { Priority } from "./Priority.php@badge";

const meta: Meta<typeof Priority> = {
  component: Priority,
  title: "Enums/Priority",
  argTypes: {
    _case: { control: "select", options: [1, 2, 3, 4] },
  },
};

export default meta;
type Story = StoryObj<typeof Priority>;

export const Low: Story = {
  args: { _case: 1 },
};

export const Medium: Story = {
  args: { _case: 2 },
};

export const High: Story = {
  args: { _case: 3 },
};

export const Critical: Story = {
  args: { _case: 4 },
};
