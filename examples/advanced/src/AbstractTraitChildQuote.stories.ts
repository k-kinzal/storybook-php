import type { Meta, StoryObj } from 'storybook-php';
import { QuoteCard } from './AbstractTraitChild.php@render';

const meta: Meta<typeof QuoteCard> = {
  component: QuoteCard,
  title: 'Components/QuoteCard',
};

export default meta;
type Story = StoryObj<typeof QuoteCard>;

export const Default: Story = {
  args: { title: 'Inspiration', quote: 'The only way to do great work is to love what you do.', source: 'Steve Jobs' },
};

export const NoSource: Story = {
  args: { title: 'Wisdom', quote: 'Simplicity is the ultimate sophistication.' },
};
