import type { Meta, StoryObj } from 'storybook-php';
import { ConcreteBadge } from './AbstractFactory.php@render';

const meta: Meta<typeof ConcreteBadge> = {
  component: ConcreteBadge,
  title: 'Patterns/AbstractFactoryBadge',
  argTypes: {
    label: { control: 'text' },
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof ConcreteBadge>;

export const Default: Story = {
  args: { label: 'Online', color: '#22c55e' },
};

export const Offline: Story = {
  args: { label: 'Offline', color: '#ef4444' },
};
