import type { Meta, StoryObj } from 'storybook-php';
import { EmailNotification, SmsNotification, PushNotification } from './NotificationChannel.php@render';

const emailMeta: Meta<typeof EmailNotification> = {
  component: EmailNotification,
  title: 'Components/NotificationChannel',
  argTypes: {
    recipient: { control: 'text' },
    message: { control: 'text' },
  },
};

export default emailMeta;
type Story = StoryObj<typeof EmailNotification>;

export const Email: Story = {
  args: { recipient: 'alice@example.com', message: 'Your order has been shipped!' },
};

export const Sms: StoryObj<typeof SmsNotification> = {
  render: (args) => args,
  component: SmsNotification,
  args: { recipient: '+1 555-0123', message: 'Your verification code is 4829.' },
};

export const Push: StoryObj<typeof PushNotification> = {
  render: (args) => args,
  component: PushNotification,
  args: { recipient: 'Mobile Device', message: 'New comment on your post.' },
};
