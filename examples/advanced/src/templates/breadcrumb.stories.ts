import type { Meta, StoryObj } from 'storybook-php';
import BreadcrumbTemplate from './breadcrumb.php';

const meta: Meta = {
  component: BreadcrumbTemplate,
  title: 'Templates/Breadcrumb',
  argTypes: {
    separator: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', url: '/' },
      { label: 'Products', url: '/products' },
      { label: 'Widget' },
    ],
    separator: '/',
  },
};

export const Arrow: Story = {
  args: {
    items: [
      { label: 'Dashboard', url: '/dash' },
      { label: 'Settings', url: '/settings' },
      { label: 'Profile' },
    ],
    separator: '>',
  },
};

export const Long: Story = {
  args: {
    items: [
      { label: 'Home', url: '/' },
      { label: 'Category', url: '/cat' },
      { label: 'Subcategory', url: '/sub' },
      { label: 'Product', url: '/prod' },
      { label: 'Details' },
    ],
    separator: '/',
  },
};
