import type { Meta, StoryObj } from 'storybook-php';
import { StatusBanner } from './StatusBanner.php@render';

const meta: Meta<typeof StatusBanner> = {
  component: StatusBanner,
  title: 'Components/StatusBanner',
  argTypes: {
    message: { control: 'text' },
    level: { control: 'select', options: ['info', 'warning', 'error', 'success'] },
    showIcon: { control: 'boolean' },
    dismissible: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBanner>;

export const Info: Story = {
  args: { message: 'This is an informational message.', level: 'info' },
};

export const Warning: Story = {
  args: { message: 'Please review your settings.', level: 'warning' },
};

export const Error: Story = {
  args: { message: 'An error occurred while saving.', level: 'error', dismissible: true },
};

export const Success: Story = {
  args: { message: 'Changes saved successfully!', level: 'success' },
};

export const NoIcon: Story = {
  args: { message: 'A plain banner without icon.', level: 'info', showIcon: false },
};
