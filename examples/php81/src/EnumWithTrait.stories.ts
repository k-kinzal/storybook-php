import type { Meta, StoryObj } from 'storybook-php';
import { TaskPriority } from './EnumWithTrait.php@badge';

const meta: Meta<typeof TaskPriority> = {
  component: TaskPriority,
  title: 'Enums/EnumWithTrait',
  argTypes: {
    _case: { control: 'select', options: ['low', 'medium', 'high', 'critical'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof TaskPriority>;

export const Low: Story = {
  args: { _case: 'low' },
};

export const Medium: Story = {
  args: { _case: 'medium', size: 'md' },
};

export const High: Story = {
  args: { _case: 'high', size: 'lg' },
};

export const Critical: Story = {
  args: { _case: 'critical', size: 'sm' },
};
