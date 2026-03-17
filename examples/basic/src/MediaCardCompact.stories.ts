import type { Meta, StoryObj } from 'storybook-php';
import { MediaCard } from './MediaCard.php@compact';

const meta: Meta<typeof MediaCard> = {
  component: MediaCard,
  title: 'Components/MediaCardCompact',
};

export default meta;
type Story = StoryObj<typeof MediaCard>;

export const Default: Story = {
  args: { title: 'Quick Update', category: 'news' },
};

export const WithImage: Story = {
  args: {
    title: 'Photo Essay',
    imageUrl: 'https://placehold.co/48x48',
    category: 'design',
  },
};
