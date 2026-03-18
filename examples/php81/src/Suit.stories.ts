import type { Meta, StoryObj } from 'storybook-php';
import { Suit } from './Suit.php@card';

const meta: Meta<typeof Suit> = {
  component: Suit,
  title: 'Enums/Suit',
  argTypes: {
    _case: { control: 'select', options: ['Hearts', 'Diamonds', 'Clubs', 'Spades'] },
    rank: { control: 'select', options: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] },
  },
};

export default meta;
type Story = StoryObj<typeof Suit>;

export const AceOfSpades: Story = {
  args: { _case: 'Spades', rank: 'A' },
};

export const QueenOfHearts: Story = {
  args: { _case: 'Hearts', rank: 'Q' },
};

export const KingOfDiamonds: Story = {
  args: { _case: 'Diamonds', rank: 'K' },
};

export const JackOfClubs: Story = {
  args: { _case: 'Clubs', rank: 'J' },
};
