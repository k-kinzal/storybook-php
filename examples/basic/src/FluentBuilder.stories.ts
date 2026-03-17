import type { Meta, StoryObj } from 'storybook-php';
import { FluentBuilder } from './FluentBuilder.php@render';

const meta: Meta<typeof FluentBuilder> = {
  component: FluentBuilder,
  title: 'Components/FluentBuilder',
  argTypes: {
    tag: { control: 'select', options: ['div', 'span', 'p', 'section'] },
    text: { control: 'text' },
    color: { control: 'color' },
    bg: { control: 'color' },
    padding: { control: { type: 'range', min: 0, max: 48, step: 4 } },
  },
};

export default meta;
type Story = StoryObj<typeof FluentBuilder>;

export const Default: Story = {
  args: { text: 'Hello, World!', padding: 16 },
};

export const Highlighted: Story = {
  args: { text: 'Important Notice', color: 'white', bg: '#ef4444', padding: 16 },
};
