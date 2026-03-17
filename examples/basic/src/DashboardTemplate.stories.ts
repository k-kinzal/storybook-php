import type { Meta, StoryObj } from 'storybook-php';
import DashboardTemplate from './templates/dashboard.php';

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
    title: 'Analytics Dashboard',
    stats: [
      { label: 'Users', value: '1,234', change: 12 },
      { label: 'Revenue', value: '$56,789', change: -3 },
      { label: 'Orders', value: '456', change: 8 },
    ],
  },
};

export const WithChart: Story = {
  args: {
    title: 'Sales Overview',
    stats: [
      { label: 'Total Sales', value: '$123,456' },
      { label: 'New Customers', value: '89', change: 15 },
    ],
    showChart: true,
  },
};

export const Empty: Story = {
  args: { title: 'Empty Dashboard' },
};
