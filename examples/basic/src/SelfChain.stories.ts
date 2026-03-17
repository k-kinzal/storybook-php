import type { Meta, StoryObj } from 'storybook-php';
import { SelfChain } from './SelfChain.php@render';

const meta: Meta<typeof SelfChain> = {
  component: SelfChain,
  title: 'Components/SelfChain',
  argTypes: {
    tag: { control: 'select', options: ['div', 'section', 'span', 'p', 'article'] },
    className: { control: 'text' },
    content: { control: 'text' },
    style: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof SelfChain>;

export const Default: Story = {
  args: { content: 'Hello from a fluent builder', tag: 'div' },
};

export const Styled: Story = {
  args: {
    content: 'Styled block',
    tag: 'section',
    className: 'highlight',
    style: 'padding: 16px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; font-family: system-ui;',
  },
};

export const Paragraph: Story = {
  args: { content: 'This is a paragraph rendered with the fluent builder.', tag: 'p', style: 'color: #4b5563; line-height: 1.6;' },
};
