import type { Meta, StoryObj } from 'storybook-php';
import { nullableLabel } from './nullableLabel.php@nullableLabel';

const meta: Meta<typeof nullableLabel> = {
  component: nullableLabel,
  title: 'Functions/NullableLabel',
  argTypes: {
    text: { control: 'text' },
    icon: { control: 'text' },
    color: { control: 'color' },
    subtitle: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof nullableLabel>;

export const TextOnly: Story = {
  args: { text: 'Status: Active' },
};

export const WithIcon: Story = {
  args: { text: 'Notification', icon: '&#x1F514;', color: '#f59e0b' },
};

export const WithSubtitle: Story = {
  args: { text: 'System Alert', icon: '&#x26A0;', color: '#ef4444', subtitle: 'Requires immediate attention' },
};
