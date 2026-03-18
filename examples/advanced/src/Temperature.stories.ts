import type { Meta, StoryObj } from 'storybook-php';
import { Temperature } from './Temperature.php@render';

const meta: Meta<typeof Temperature> = {
  component: Temperature,
  title: 'Components/Temperature',
  argTypes: {
    value: { control: { type: 'number', step: 0.1 } },
    unit: { control: 'select', options: ['C', 'F', 'K'] },
  },
};

export default meta;
type Story = StoryObj<typeof Temperature>;

export const Freezing: Story = {
  args: { value: -5.0, unit: 'C' },
};

export const RoomTemp: Story = {
  args: { value: 22.5, unit: 'C' },
};

export const Hot: Story = {
  args: { value: 38.0, unit: 'C' },
};
