import type { Meta, StoryObj } from 'storybook-php';
import { Currency } from './Currency.php@table';

const meta: Meta<typeof Currency> = {
  component: Currency,
  title: 'Enums/CurrencyTable',
  argTypes: {
    amount: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Currency>;

export const Default: Story = {
  args: { amount: 100.00 },
};

export const LargeAmount: Story = {
  args: { amount: 99999.99 },
};
