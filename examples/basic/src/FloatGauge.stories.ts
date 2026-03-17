import type { Meta, StoryObj } from 'storybook-php';
import { FloatGauge } from './FloatGauge.php@render';

const meta: Meta<typeof FloatGauge> = {
  component: FloatGauge,
  title: 'Components/FloatGauge',
  argTypes: {
    label: { control: 'text' },
    value: { control: { type: 'number', step: 0.1 } },
    min: { control: 'number' },
    max: { control: 'number' },
    precision: { control: { type: 'number', min: 0, max: 4 } },
    unit: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof FloatGauge>;

export const Default: Story = {
  args: { label: 'Progress', value: 73.5 },
};

export const LowValue: Story = {
  args: { label: 'Battery', value: 12.8, unit: '%' },
};

export const Temperature: Story = {
  args: { label: 'CPU Temp', value: 67.3, min: 20.0, max: 105.0, unit: '°C' },
};

export const HighPrecision: Story = {
  args: { label: 'Accuracy', value: 99.847, precision: 3, unit: '%' },
};
