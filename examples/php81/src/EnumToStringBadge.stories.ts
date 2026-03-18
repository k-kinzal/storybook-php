import type { Meta, StoryObj } from 'storybook-php';
import { MoodCard } from './EnumToString.php@badge';

const meta: Meta<typeof MoodCard> = {
  component: MoodCard,
  title: 'Components/MoodBadge',
  argTypes: {
    mood: { control: 'select', options: ['happy', 'sad', 'neutral', 'excited'] },
  },
};

export default meta;
type Story = StoryObj<typeof MoodCard>;

export const HappyBadge: Story = {
  args: { mood: 'happy' },
};

export const ExcitedBadge: Story = {
  args: { mood: 'excited' },
};
