import type { Meta, StoryObj } from 'storybook-php';
import { ConstantNotice } from './ConstantNotice.php@render';

const meta: Meta<typeof ConstantNotice> = {
  component: ConstantNotice,
  title: 'Components/ConstantNotice',
  argTypes: {
    message: { control: 'text' },
    level: { control: 'select', options: ['info', 'warning', 'error', 'success'] },
    closable: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ConstantNotice>;

export const Info: Story = {
  args: { message: 'This is an informational notice.' },
};

export const Warning: Story = {
  args: { message: 'Please review before continuing.', level: 'warning' },
};

export const Error: Story = {
  args: { message: 'Something went wrong!', level: 'error', closable: true },
};

export const Success: Story = {
  args: { message: 'Operation completed successfully.', level: 'success' },
};
