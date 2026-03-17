import type { Meta, StoryObj } from 'storybook-php';
import { FluentBuilder } from './FluentBuilder.php@badge';

const meta: Meta<typeof FluentBuilder> = {
  component: FluentBuilder,
  title: 'Components/FluentBuilder/Badge',
  argTypes: {
    text: { control: 'text' },
    bg: { control: 'color' },
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof FluentBuilder>;

export const Default: Story = {
  args: { text: 'New' },
};

export const Success: Story = {
  args: { text: 'Active', bg: '#22c55e' },
};

export const Warning: Story = {
  args: { text: 'Pending', bg: '#f59e0b', color: '#111827' },
};
