import type { Meta, StoryObj } from "storybook-php";
import { UserProfile } from "./UserProfile.php@render";

const meta: Meta<typeof UserProfile> = {
  component: UserProfile,
  title: "Components/UserProfile",
  argTypes: {
    name: { control: "text" },
    email: { control: "text" },
    role: { control: "select", options: ["member", "editor", "admin"] },
    avatarUrl: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof UserProfile>;

export const Default: Story = {
  args: { name: "Jane Doe", email: "jane@example.com" },
};

export const Admin: Story = {
  args: { name: "Alice Smith", email: "alice@example.com", role: "admin" },
};

export const Editor: Story = {
  args: { name: "Bob Johnson", email: "bob@example.com", role: "editor" },
};
