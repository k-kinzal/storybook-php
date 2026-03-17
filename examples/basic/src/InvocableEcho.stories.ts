import type { Meta, StoryObj } from 'storybook-php';
import { InvocableEcho } from './InvocableEcho.php@__invoke';

const meta: Meta<typeof InvocableEcho> = {
  component: InvocableEcho,
  title: 'Components/InvocableEcho',
  argTypes: {
    prefix: { control: 'text' },
    variant: { control: 'select', options: ['info', 'success', 'warning', 'error'] },
    message: { control: 'text' },
    showIcon: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof InvocableEcho>;

export const Default: Story = {
  args: { message: 'This is an important notice.' },
};

export const SuccessNote: Story = {
  args: { prefix: 'Done', variant: 'success', message: 'All tasks completed.' },
};

export const NoIcon: Story = {
  args: { message: 'Plain notification.', showIcon: false },
};
