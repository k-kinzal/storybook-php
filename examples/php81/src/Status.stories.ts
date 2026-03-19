import type { Meta, StoryObj } from "storybook-php";
import { Status } from "./Status.php@label";

const meta: Meta<typeof Status> = {
  component: Status,
  title: "Enums/Status",
  argTypes: {
    _case: { control: "select", options: ["active", "inactive", "pending"] },
    prefix: { control: "text" },
    uppercase: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Status>;

export const Active: Story = {
  args: { _case: "active" },
};

export const Inactive: Story = {
  args: { _case: "inactive" },
};

export const WithPrefix: Story = {
  args: { _case: "pending", prefix: "Status" },
};

export const Uppercase: Story = {
  args: { _case: "active", prefix: "User", uppercase: true },
};
