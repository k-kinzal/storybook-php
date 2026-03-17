import type { Meta, StoryObj } from 'storybook-php';
import { ValueObject } from './ValueObject.php@render';

const meta: Meta<typeof ValueObject> = {
  component: ValueObject,
  title: 'Patterns/ValueObject',
  argTypes: {
    id: { control: 'text' },
    value: { control: 'number' },
    unit: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ValueObject>;

export const Default: Story = {
  args: { id: 'temperature', value: 72, unit: 'F' },
};

export const Counter: Story = {
  args: { id: 'visitors', value: 1453 },
};

export const Percentage: Story = {
  args: { id: 'uptime', value: 99, unit: '%' },
};
