import type { Meta, StoryObj } from 'storybook-php';
import AlertTemplate from './alert.php';

const meta: Meta = {
  component: AlertTemplate,
  title: 'Templates/Alert',
  argTypes: {
    type: { control: 'select', options: ['info', 'success', 'warning', 'error'] },
    message: { control: 'text' },
    title: { control: 'text' },
    dismissible: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Info: Story = {
  args: { type: 'info', message: 'This is an informational message.' },
};

export const Success: Story = {
  args: { type: 'success', message: 'Your changes have been saved successfully.', title: 'Success' },
};

export const Warning: Story = {
  args: { type: 'warning', message: 'Your session will expire in 5 minutes.', title: 'Warning', dismissible: true },
};

export const Error: Story = {
  args: { type: 'error', message: 'Failed to save changes. Please try again.', title: 'Error', dismissible: true },
};
