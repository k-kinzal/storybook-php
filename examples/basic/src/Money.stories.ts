import type { Meta, StoryObj } from 'storybook-php';
import { Money } from './Money.php@render';

const meta: Meta<typeof Money> = {
  component: Money,
  title: 'Components/Money',
  argTypes: {
    amount: { control: 'number', description: 'Amount in cents' },
    currency: { control: 'select', options: ['USD', 'EUR', 'GBP', 'JPY'] },
  },
};

export default meta;
type Story = StoryObj<typeof Money>;

export const Default: Story = {
  args: { amount: 1999 },
};

export const Euro: Story = {
  args: { amount: 4999, currency: 'EUR' },
};

export const Pounds: Story = {
  args: { amount: 12500, currency: 'GBP' },
};
