import type { Meta, StoryObj } from 'storybook-php';
import NotificationTemplate from './notification.php';

const meta: Meta = {
  component: NotificationTemplate,
  title: 'Templates/Notification',
  argTypes: {
    title: { control: 'text' },
    message: { control: 'text' },
    type: { control: 'select', options: ['info', 'success', 'warning', 'error'] },
    time: { control: 'text' },
    unread: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Info: Story = {
  args: {
    title: 'New comment',
    message: 'Alice replied to your pull request.',
    type: 'info',
    time: '2 min ago',
    unread: true,
  },
};

export const Success: Story = {
  args: {
    title: 'Deployment complete',
    message: 'Your app was deployed to production.',
    type: 'success',
    time: '5 min ago',
    unread: true,
  },
};

export const Warning: Story = {
  args: {
    title: 'Rate limit approaching',
    message: 'You have used 90% of your API quota.',
    type: 'warning',
    time: '1 hour ago',
  },
};

export const ErrorNotification: Story = {
  args: {
    title: 'Build failed',
    message: 'Tests failed on the main branch.',
    type: 'error',
    time: '10 min ago',
    unread: true,
  },
};

export const Read: Story = {
  args: {
    title: 'Welcome aboard',
    message: 'Thanks for joining our platform.',
    type: 'info',
    time: 'yesterday',
    unread: false,
  },
};
