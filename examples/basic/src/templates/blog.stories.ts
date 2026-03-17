import type { Meta, StoryObj } from 'storybook-php';
import BlogTemplate from './blog.php';

const meta: Meta = {
  component: BlogTemplate,
  title: 'Templates/Blog',
  argTypes: {
    title: { control: 'text' },
    author: { control: 'text' },
    body: { control: 'text' },
    date: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    title: 'Getting Started with PHP 8.2',
    author: 'Jane Doe',
    body: 'PHP 8.2 introduces readonly classes, DNF types, and many other improvements that make the language more expressive and type-safe.',
    date: 'March 15, 2025',
    tags: ['PHP', 'Tutorial', 'Web Development'],
  },
};

export const NoTags: Story = {
  args: {
    title: 'A Simple Post',
    author: 'John Smith',
    body: 'This is a blog post without any tags.',
    date: 'January 1, 2025',
  },
};
