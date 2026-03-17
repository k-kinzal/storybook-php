import type { Meta, StoryObj } from 'storybook-php';
import { ProductCard } from './ProductCard.php@render';

const meta: Meta<typeof ProductCard> = {
  component: ProductCard,
  title: 'Components/ProductCard',
  argTypes: {
    status: { control: 'select', options: ['draft', 'published', 'archived'] },
    price: { control: { type: 'number', min: 0, step: 0.01 } },
  },
};

export default meta;
type Story = StoryObj<typeof ProductCard>;

export const Draft: Story = {
  args: { name: 'Widget', price: 29.99 },
};

export const Published: Story = {
  args: { name: 'Premium Widget', price: 99.99, config: { currency: 'JPY', decimals: 0 }, status: 'published' },
};

export const Archived: Story = {
  args: { name: 'Old Widget', price: 9.99, config: { currency: 'EUR', decimals: 2 }, status: 'archived' },
};
