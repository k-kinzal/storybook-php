import type { Meta, StoryObj } from 'storybook-php';
import { AsymmetricVisibility } from './AsymmetricVisibility.php@render';

const meta: Meta<typeof AsymmetricVisibility> = {
  component: AsymmetricVisibility,
  title: 'PHP84/AsymmetricVisibility',
};

export default meta;
type Story = StoryObj<typeof AsymmetricVisibility>;

export const Draft: Story = {
  args: { title: 'My Article', status: 'draft', views: 42 },
};

export const Published: Story = {
  args: { title: 'Released Post', status: 'published', views: 1337 },
};
