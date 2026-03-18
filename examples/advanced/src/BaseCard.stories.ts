import type { Meta, StoryObj } from 'storybook-php';
import { BaseCard } from './FeatureCard.php@render';

const meta: Meta<typeof BaseCard> = {
  component: BaseCard,
  title: 'Components/BaseCard',
  argTypes: {
    title: { control: 'text' },
    body: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof BaseCard>;

export const Default: Story = {
  args: { title: 'Base Card', body: 'A simple card with no extra decoration.' },
};

export const TitleOnly: Story = {
  args: { title: 'Header Only' },
};
