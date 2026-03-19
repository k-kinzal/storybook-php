import type { Meta, StoryObj } from "storybook-php";
import { Weekday } from "./Weekday.php@badge";

const meta: Meta<typeof Weekday> = {
  component: Weekday,
  title: "Enums/Weekday",
  argTypes: {
    _case: {
      control: "select",
      options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Weekday>;

export const Monday: Story = {
  args: { _case: "Monday" },
};

export const Friday: Story = {
  args: { _case: "Friday" },
};

export const Saturday: Story = {
  args: { _case: "Saturday" },
};

export const Sunday: Story = {
  args: { _case: "Sunday" },
};
