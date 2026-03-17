import type { Meta, StoryObj } from 'storybook-php';
import { SimpleBox } from './SimpleBox.php@render';

const meta: Meta<typeof SimpleBox> = {
  component: SimpleBox,
  title: 'Components/SimpleBox',
  argTypes: {
    content: { control: 'text' },
    borderColor: { control: 'color' },
    padding: { control: { type: 'range', min: 0, max: 48, step: 4 } },
  },
};

export default meta;
type Story = StoryObj<typeof SimpleBox>;

export const Default: Story = {
  args: { content: 'A simple box without a namespace.' },
};

export const Styled: Story = {
  args: { content: 'Custom styled box', borderColor: '#3b82f6', padding: 24 },
};

export const Compact: Story = {
  args: { content: 'Compact', padding: 4 },
};
