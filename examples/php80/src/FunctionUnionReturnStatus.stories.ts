import type { Meta, StoryObj } from 'storybook-php';
import { renderStatus } from './FunctionUnionReturn.php@renderStatus';

const meta: Meta<typeof renderStatus> = {
  component: renderStatus,
  title: 'Functions/RenderStatus',
  argTypes: {
    status: { control: 'select', options: ['active', 'inactive', 'pending'] },
    showIcon: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof renderStatus>;

export const Active: Story = {
  args: { status: 'active' },
};

export const Inactive: Story = {
  args: { status: 'inactive', showIcon: false },
};

export const Pending: Story = {
  args: { status: 'pending' },
};
