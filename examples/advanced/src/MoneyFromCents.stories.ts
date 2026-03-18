import type { Meta, StoryObj } from 'storybook-php';
import { Money } from './Money.php@fromCents';

const meta: Meta<typeof Money> = {
  component: Money,
  title: 'Components/MoneyFromCents',
  argTypes: {
    cents: { control: 'number' },
    currency: { control: 'select', options: ['USD', 'EUR', 'GBP', 'JPY'] },
  },
};

export default meta;
type Story = StoryObj<typeof Money>;

export const Default: Story = {
  args: { cents: 1999 },
};

export const Euro: Story = {
  args: { cents: 4999, currency: 'EUR' },
};
