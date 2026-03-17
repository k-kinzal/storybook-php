import type { Meta, StoryObj } from 'storybook-php';
import { IntersectionBadge } from './Intersection.php@render';

const meta: Meta<typeof IntersectionBadge> = {
  component: IntersectionBadge,
  title: 'Patterns/IntersectionType',
  argTypes: {
    label: { control: 'text' },
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof IntersectionBadge>;

export const Default: Story = {
  args: { label: 'TypeSafe', color: '#3b82f6' },
};

export const Green: Story = {
  args: { label: 'Validated', color: '#22c55e' },
};
