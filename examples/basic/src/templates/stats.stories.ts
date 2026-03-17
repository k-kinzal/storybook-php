import type { Meta, StoryObj } from 'storybook-php';
import StatsTemplate from '../templates/stats.php';

const meta: Meta = {
  component: StatsTemplate,
  title: 'Templates/Stats',
  argTypes: {
    columns: { control: { type: 'number', min: 1, max: 6 } },
    variant: { control: 'select', options: ['default', 'colored'] },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    items: [
      { label: 'Users', value: '12,345' },
      { label: 'Revenue', value: '$89K' },
      { label: 'Growth', value: '+23%' },
    ],
    columns: 3,
  },
};

export const Colored: Story = {
  args: {
    items: [
      { label: 'Downloads', value: '1.2M', icon: '📦' },
      { label: 'Stars', value: '8,432', icon: '⭐' },
      { label: 'Contributors', value: '156', icon: '👥' },
      { label: 'Issues', value: '23', icon: '🐛' },
    ],
    columns: 4,
    variant: 'colored',
  },
};

export const TwoColumn: Story = {
  args: {
    items: [
      { label: 'Active', value: '42' },
      { label: 'Completed', value: '108' },
    ],
    columns: 2,
  },
};

export const Empty: Story = {
  args: { items: [], columns: 3 },
};
