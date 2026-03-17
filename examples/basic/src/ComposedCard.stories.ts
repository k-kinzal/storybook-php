import type { Meta, StoryObj } from 'storybook-php';
import { ComposedCard } from './ComposedCard.php@render';

const meta: Meta<typeof ComposedCard> = {
  component: ComposedCard,
  title: 'Patterns/ComposedCard',
  argTypes: {
    title: { control: 'text' },
    body: { control: 'text' },
    date: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ComposedCard>;

export const Default: Story = {
  args: {
    title: 'Getting Started with PHP 8.2',
    author: { name: 'Alice', role: 'Lead Developer' },
    body: 'A comprehensive guide to the latest PHP features.',
  },
};

export const WithDate: Story = {
  args: {
    title: 'Release Notes v2.0',
    author: { name: 'Bob', role: 'Maintainer' },
    body: 'Major performance improvements and bug fixes.',
    date: '2025-01-15',
  },
};
