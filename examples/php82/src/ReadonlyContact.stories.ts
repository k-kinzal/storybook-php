import type { Meta, StoryObj } from "storybook-php";
import { ReadonlyContact } from "./ReadonlyContact.php@render";

const meta: Meta<typeof ReadonlyContact> = {
  component: ReadonlyContact,
  title: "Components/ReadonlyContact",
  argTypes: {
    name: { control: "text" },
    email: { control: "text" },
    role: { control: "select", options: ["Admin", "Editor", "Member", "Viewer"] },
    avatar: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof ReadonlyContact>;

export const Default: Story = {
  args: { name: "Jane Smith", email: "jane@example.com" },
};

export const Admin: Story = {
  args: { name: "Alex Johnson", email: "alex@example.com", role: "Admin" },
};

export const WithAvatar: Story = {
  args: {
    name: "Sam Lee",
    email: "sam@example.com",
    role: "Editor",
    avatar: "https://i.pravatar.cc/80?u=sam",
  },
};
