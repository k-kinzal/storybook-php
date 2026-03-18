import type { Meta, StoryObj } from 'storybook-php';
import { MediaCard } from './MediaCard.php@header';

const meta: Meta<typeof MediaCard> = {
  component: MediaCard,
  title: 'Components/MediaCardHeader',
};

export default meta;
type Story = StoryObj<typeof MediaCard>;

export const Default: Story = {
  args: { title: 'Featured Article' },
};
