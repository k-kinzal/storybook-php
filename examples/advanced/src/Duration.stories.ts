import type { Meta, StoryObj } from 'storybook-php';
import { Duration } from './Duration.php@render';

const meta: Meta<typeof Duration> = {
  component: Duration,
  title: 'Patterns/Duration',
  argTypes: {
    hours: { control: { type: 'range', min: 0, max: 24 } },
    minutes: { control: { type: 'range', min: 0, max: 59 } },
    seconds: { control: { type: 'range', min: 0, max: 59 } },
  },
};

export default meta;
type Story = StoryObj<typeof Duration>;

export const Short: Story = {
  args: { hours: 0, minutes: 5, seconds: 30 },
};

export const OneHour: Story = {
  args: { hours: 1, minutes: 0, seconds: 0 },
};

export const Mixed: Story = {
  args: { hours: 2, minutes: 30, seconds: 15 },
};

export const Zero: Story = {
  args: { hours: 0, minutes: 0, seconds: 0 },
};
