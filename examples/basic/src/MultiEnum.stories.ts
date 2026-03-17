import type { Meta, StoryObj } from 'storybook-php';
import { TextAlign } from './MultiEnum.php@preview';

const meta: Meta<typeof TextAlign> = {
  component: TextAlign,
  title: 'Enums/TextAlign',
  argTypes: {
    _case: { control: 'select', options: ['left', 'center', 'right'] },
    text: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof TextAlign>;

export const Left: Story = {
  args: { _case: 'left', text: 'Left-aligned text content.' },
};

export const Center: Story = {
  args: { _case: 'center', text: 'Centered text content.' },
};

export const Right: Story = {
  args: { _case: 'right', text: 'Right-aligned text content.' },
};
