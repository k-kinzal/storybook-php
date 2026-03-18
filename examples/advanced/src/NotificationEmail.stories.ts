import type { Meta, StoryObj } from 'storybook-php';
import { EmailNotification } from './NotificationChannel.php@render';

const meta: Meta<typeof EmailNotification> = {
  component: EmailNotification,
  title: 'Patterns/AbstractTemplate/Email',
  argTypes: {
    message: { control: 'text' },
    recipient: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof EmailNotification>;

export const Default: Story = {
  args: { message: 'Your order has been shipped!', recipient: 'user@example.com' },
};

export const Welcome: Story = {
  args: { message: 'Welcome to our platform!', recipient: 'newuser@example.com' },
};
