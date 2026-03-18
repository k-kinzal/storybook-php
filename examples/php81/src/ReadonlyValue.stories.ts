import type { Meta, StoryObj } from 'storybook-php';
import { ReadonlyValue } from './ReadonlyValue.php@render';

const meta: Meta<typeof ReadonlyValue> = {
  component: ReadonlyValue,
  title: 'Patterns/ReadonlyValue',
  argTypes: {
    id: { control: 'text' },
    value: { control: 'number' },
    unit: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ReadonlyValue>;

export const Pixels: Story = {
  args: { id: 'width', value: 320, unit: 'px' },
};

export const Percentage: Story = {
  args: { id: 'progress', value: 75, unit: '%' },
};

export const Milliseconds: Story = {
  args: { id: 'latency', value: 42, unit: 'ms' },
};
