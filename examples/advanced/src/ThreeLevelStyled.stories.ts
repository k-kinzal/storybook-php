import type { Meta, StoryObj } from 'storybook-php';
import { StyledElement } from './ThreeLevel.php@render';

const meta: Meta<typeof StyledElement> = {
  component: StyledElement,
  title: 'Patterns/DeepInheritance/StyledElement',
  argTypes: {
    text: { control: 'text' },
    tag: { control: 'select', options: ['div', 'span', 'p', 'h3'] },
    color: { control: 'color' },
    background: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof StyledElement>;

export const Default: Story = {
  args: { text: 'Styled element with inherited base', tag: 'div', color: '#1e40af', background: '#eff6ff' },
};

export const Heading: Story = {
  args: { text: 'Section Title', tag: 'h3', color: '#111827' },
};
