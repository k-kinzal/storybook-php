import type { Meta, StoryObj } from 'storybook-php';
import { BladeNav } from './BladeNav.php@render';

const meta: Meta<typeof BladeNav> = {
  component: BladeNav,
  title: 'Laravel/BladeNav',
};

export default meta;
type Story = StoryObj<typeof BladeNav>;

export const Default: Story = {
  args: { brand: 'MyApp' },
};

export const CustomItems: Story = {
  args: {
    brand: 'DevSite',
    items: [
      { label: 'Docs', href: '/docs', active: true },
      { label: 'Blog', href: '/blog' },
      { label: 'API', href: '/api' },
      { label: 'Support', href: '/support' },
    ],
  },
};
