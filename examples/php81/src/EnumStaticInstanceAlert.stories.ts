import type { Meta, StoryObj } from 'storybook-php';
import { EnumStaticInstance } from './EnumStaticInstance.php@render';

const meta: Meta<typeof EnumStaticInstance> = {
  component: EnumStaticInstance,
  title: 'Enums/EnumStaticInstanceAlert',
  argTypes: {
    _case: { control: 'select', options: ['info', 'success', 'warning', 'error'] },
    message: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof EnumStaticInstance>;

export const InfoAlert: Story = {
  args: { _case: 'info', message: 'This is an informational message.' },
};

export const ErrorAlert: Story = {
  args: { _case: 'error', message: 'Something went wrong!' },
};
