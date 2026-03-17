import type { Meta, StoryObj } from 'storybook-php';
import { StyledText } from './StyledText.php@render';

const meta: Meta<typeof StyledText> = {
  component: StyledText,
  title: 'Components/StyledText',
  argTypes: {
    text: { control: 'text' },
    tag: { control: 'select', options: ['p', 'h1', 'h2', 'h3', 'span'] },
  },
};

export default meta;
type Story = StoryObj<typeof StyledText>;

export const Default: Story = {
  args: { text: 'Hello, styled world!' },
};

export const Heading: Story = {
  args: { text: 'Large Heading', tag: 'h1' },
};

export const Custom: Story = {
  args: {
    text: 'Custom styled text',
    tag: 'h2',
    style: { fontFamily: 'Georgia, serif', fontSize: 24, color: '#7c3aed', fontWeight: 'bold' },
  },
};
