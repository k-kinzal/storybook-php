import type { Meta, StoryObj } from 'storybook-php';
import { calcDiscount } from './scalarFunc.php@calcDiscount';

const meta: Meta<typeof calcDiscount> = {
  component: calcDiscount,
  title: 'Functions/CalcDiscount',
  argTypes: {
    price: { control: { type: 'number', min: 0, step: 0.01 } },
    percent: { control: { type: 'range', min: 0, max: 100, step: 5 } },
  },
};

export default meta;
type Story = StoryObj<typeof calcDiscount>;

export const TenPercent: Story = {
  args: { price: 99.99, percent: 10 },
};

export const HalfOff: Story = {
  args: { price: 49.99, percent: 50 },
};

export const NoDiscount: Story = {
  args: { price: 29.99, percent: 0 },
};
