import type { Meta, StoryObj } from 'storybook-php';
import GalleryTemplate from './gallery.php';

const meta: Meta = {
  component: GalleryTemplate,
  title: 'Templates/Gallery',
  argTypes: {
    columns: { control: { type: 'number', min: 1, max: 6 } },
    gap: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    images: [
      { emoji: '🌄', caption: 'Sunrise' },
      { emoji: '🏔️', caption: 'Mountain' },
      { emoji: '🌊', caption: 'Ocean' },
      { emoji: '🌺', caption: 'Flower' },
      { emoji: '🦋', caption: 'Butterfly' },
      { emoji: '🌈', caption: 'Rainbow' },
    ],
    columns: 3,
    gap: '12px',
  },
};

export const TwoColumns: Story = {
  args: {
    images: [
      { emoji: '📷', caption: 'Camera' },
      { emoji: '🎨', caption: 'Art' },
      { emoji: '🎵', caption: 'Music' },
      { emoji: '📚', caption: 'Books' },
    ],
    columns: 2,
    gap: '16px',
  },
};

export const Empty: Story = {
  args: { columns: 3 },
};
