import type { Meta, StoryObj } from 'storybook-php';
import { NoParamClock } from './NoParamClock.php@render';

const meta: Meta<typeof NoParamClock> = {
  component: NoParamClock,
  title: 'Components/NoParamClock',
  argTypes: {
    timezone: { control: 'select', options: ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'] },
    format: { control: 'text', description: 'PHP date format string' },
  },
};

export default meta;
type Story = StoryObj<typeof NoParamClock>;

export const Default: Story = {
  args: { timezone: 'UTC' },
};

export const Tokyo: Story = {
  args: { timezone: 'Asia/Tokyo', format: 'Y-m-d H:i' },
};
