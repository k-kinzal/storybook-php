import type { Meta, StoryObj } from 'storybook-php';
import { DynamicConstFetch } from './DynamicConstFetch.php@render';

const meta: Meta<typeof DynamicConstFetch> = {
  component: DynamicConstFetch,
  title: 'PHP83/DynamicConstFetch',
};

export default meta;
type Story = StoryObj<typeof DynamicConstFetch>;

export const Info: Story = {
  args: { level: 'INFO', message: 'Operation completed successfully.' },
};

export const Warning: Story = {
  args: { level: 'WARNING', message: 'Disk space running low.' },
};

export const Error: Story = {
  args: { level: 'ERROR', message: 'Connection failed.' },
};
