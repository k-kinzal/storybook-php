import type { Meta, StoryObj } from 'storybook-php';
import { SmsNotification } from './NotificationChannel.php@render';

const meta: Meta<typeof SmsNotification> = {
  component: SmsNotification,
  title: 'Patterns/AbstractTemplate/SMS',
  argTypes: {
    message: { control: 'text' },
    recipient: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof SmsNotification>;

export const Default: Story = {
  args: { message: 'Your verification code is 123456.', recipient: '+1-555-0100' },
};
