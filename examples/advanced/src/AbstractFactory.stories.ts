import type { Meta, StoryObj } from 'storybook-php';
import { AbstractFactory } from './AbstractFactory.php@pill';

const meta: Meta<typeof AbstractFactory> = {
  component: AbstractFactory,
  title: 'Patterns/AbstractFactoryPill',
  argTypes: {
    label: { control: 'text' },
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof AbstractFactory>;

export const Default: Story = {
  args: { label: 'Active', color: '#3b82f6' },
};

export const Success: Story = {
  args: { label: 'Verified', color: '#22c55e' },
};

export const Danger: Story = {
  args: { label: 'Expired', color: '#ef4444' },
};
