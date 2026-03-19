import type { Meta, StoryObj } from "storybook-php";
import { PushNotification } from "./NotificationChannel.php@render";

const meta: Meta<typeof PushNotification> = {
  component: PushNotification,
  title: "Patterns/AbstractTemplate/Push",
  argTypes: {
    message: { control: "text" },
    recipient: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof PushNotification>;

export const Default: Story = {
  args: { message: "You have a new follower!", recipient: "Device-0001" },
};
