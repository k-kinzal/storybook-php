import type { Meta, StoryObj } from 'storybook-php';
import { ClosureCapture } from './ClosureCapture.php@render';

const meta: Meta<typeof ClosureCapture> = {
  component: ClosureCapture,
  title: 'PHP85/ClosureCapture',
};

export default meta;
type Story = StoryObj<typeof ClosureCapture>;

export const Default: Story = {
  args: { prefix: 'Item', separator: ' | ' },
};

export const Custom: Story = {
  args: { prefix: 'Entry', separator: ' → ' },
};
