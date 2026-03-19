import type { Meta, StoryObj } from "storybook-php";
import { Permission } from "./EnumPermission.php@includes";

const meta: Meta<typeof Permission> = {
  component: Permission,
  title: "Enums/Permission/Check",
  argTypes: {
    _case: { control: "select", options: ["read", "write", "delete", "admin"] },
    action: { control: "select", options: ["read", "write", "delete", "admin"] },
  },
};

export default meta;
type Story = StoryObj<typeof Permission>;

export const ReadCanRead: Story = {
  args: { _case: "read", action: "read" },
};

export const ReadCannotWrite: Story = {
  args: { _case: "read", action: "write" },
};

export const AdminCanDelete: Story = {
  args: { _case: "admin", action: "delete" },
};

export const WriteCannotDelete: Story = {
  args: { _case: "write", action: "delete" },
};
