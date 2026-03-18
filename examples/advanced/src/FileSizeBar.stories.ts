import type { Meta, StoryObj } from 'storybook-php';
import { FileSize } from './FileSize.php@bar';

const meta: Meta<typeof FileSize> = {
  component: FileSize,
  title: 'Components/FileSize/Bar',
  argTypes: {
    used: { control: { type: 'number' } },
    total: { control: { type: 'number' } },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof FileSize>;

export const Normal: Story = {
  args: { used: 3221225472, total: 10737418240, label: 'Storage' },
};

export const AlmostFull: Story = {
  args: { used: 9663676416, total: 10737418240, label: 'Disk Usage' },
};

export const Empty: Story = {
  args: { used: 0, total: 5368709120, label: 'Cache' },
};
