import type { Meta, StoryObj } from 'storybook-php';
import DashboardTemplate from './dashboard.php';

const meta: Meta = {
  component: DashboardTemplate,
  title: 'Templates/Dashboard',
  argTypes: {
    title: { control: 'text' },
    showChart: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    title: 'Dashboard',
    stats: [
      { label: 'Users', value: '12,345', change: 12 },
      { label: 'Revenue', value: '$89K', change: -3 },
      { label: 'Orders', value: '456', change: 8 },
    ],
    showChart: false,
  },
};

export const WithChart: Story = {
  args: {
    title: 'Analytics',
    stats: [
      { label: 'Page Views', value: '1.2M', change: 24 },
      { label: 'Bounce Rate', value: '32%', change: -5 },
    ],
    showChart: true,
  },
};

export const Empty: Story = {
  args: {
    title: 'Empty Dashboard',
    stats: [],
    showChart: false,
  },
};
