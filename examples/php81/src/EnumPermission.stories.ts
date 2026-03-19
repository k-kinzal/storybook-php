import type { Meta, StoryObj } from "storybook-php";
import { Permission } from "./EnumPermission.php@badge";

const meta: Meta<typeof Permission> = {
  component: Permission,
  title: "Enums/Permission/Badge",
  argTypes: {
    _case: { control: "select", options: ["read", "write", "delete", "admin"] },
  },
};

export default meta;
type Story = StoryObj<typeof Permission>;

export const Read: Story = {
  args: { _case: "read" },
};

export const Write: Story = {
  args: { _case: "write" },
};

export const Delete: Story = {
  args: { _case: "delete" },
};

export const Admin: Story = {
  args: { _case: "admin" },
};
