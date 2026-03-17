import type { Meta, StoryObj } from 'storybook-php';
import NestedTemplate from '../templates/nested.php';

const meta: Meta = {
  component: NestedTemplate,
  title: 'Templates/Nested',
  argTypes: {
    heading: { control: 'text' },
    badgeText: { control: 'text' },
    badgeColor: { control: 'color' },
    content: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { heading: 'Nested Template', badgeText: 'New', badgeColor: '#22c55e', content: 'This template includes a partial badge sub-template.' },
};

export const NoBadge: Story = {
  args: { heading: 'Without Badge', content: 'Content without a badge partial.' },
};
