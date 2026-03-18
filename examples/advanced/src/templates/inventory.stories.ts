import type { Meta, StoryObj } from 'storybook-php';
import InventoryTemplate from '../templates/inventory.php';

const meta: Meta = {
  component: InventoryTemplate,
  title: 'Templates/Inventory',
  argTypes: {
    currency: { control: 'select', options: ['USD', 'EUR'] },
    showStock: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    products: [
      { name: 'Widget A', price: 29.99, stock: 42 },
      { name: 'Widget B', price: 49.50, stock: 5 },
      { name: 'Widget C', price: 9.99, stock: 0 },
    ],
    currency: 'USD',
    showStock: true,
  },
};

export const WithoutStock: Story = {
  args: {
    products: [
      { name: 'Basic Plan', price: 9.99 },
      { name: 'Pro Plan', price: 29.99 },
    ],
    currency: 'USD',
    showStock: false,
  },
};

export const EuroCurrency: Story = {
  args: {
    products: [
      { name: 'Espresso Machine', price: 199.00, stock: 12 },
      { name: 'Coffee Grinder', price: 89.50, stock: 3 },
    ],
    currency: 'EUR',
    showStock: true,
  },
};

export const Empty: Story = {
  args: {
    products: [],
    showStock: false,
  },
};
