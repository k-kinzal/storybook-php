import type { Meta, StoryObj } from 'storybook-php';
import { MediaCard } from './MediaCard.php@full';

const meta: Meta<typeof MediaCard> = {
  component: MediaCard,
  title: 'Components/MediaCard',
  argTypes: {
    category: { control: 'select', options: ['general', 'tech', 'design', 'news'] },
  },
};

export default meta;
type Story = StoryObj<typeof MediaCard>;

export const Full: Story = {
  args: {
    title: 'Getting Started with PHP',
    description: 'Learn how to build modern PHP components with Storybook.',
    category: 'tech',
  },
};

export const WithImage: Story = {
  args: {
    title: 'Design Systems',
    description: 'Building consistent UI with component libraries.',
    imageUrl: 'https://placehold.co/360x200',
    category: 'design',
  },
};
