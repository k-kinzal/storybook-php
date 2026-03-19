import type { Meta, StoryObj } from "storybook-php";
import { UserAvatar } from "./UserAvatar.php@badge";

const meta: Meta<typeof UserAvatar> = {
  component: UserAvatar,
  title: "Components/UserAvatar/Badge",
  argTypes: {
    name: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof UserAvatar>;

export const Default: Story = {
  args: { name: "Alice Johnson" },
};

export const Short: Story = {
  args: { name: "Bob" },
};
