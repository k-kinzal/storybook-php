import type { Meta, StoryObj } from 'storybook-php';
import { TypedProduct } from './TypedProduct.php@render';

const meta: Meta<typeof TypedProduct> = {
  component: TypedProduct,
  title: 'Components/TypedProduct',
  argTypes: {
    name: { control: 'text' },
    price: { control: 'number' },
    currency: { control: 'select', options: ['USD', 'EUR', 'GBP', 'JPY'] },
    description: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof TypedProduct>;

export const Default: Story = {
  args: { name: 'Widget Pro', price: 29.99 },
};

export const Euro: Story = {
  args: { name: 'Premium Plan', price: 49.99, currency: 'EUR', description: 'Annual subscription' },
};

export const Yen: Story = {
  args: { name: 'Tokyo Special', price: 3980, currency: 'JPY' },
};
