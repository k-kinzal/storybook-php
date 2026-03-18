import type { Meta, StoryObj } from 'storybook-php';
import { ChainBuilder } from './ChainBuilder.php@render';

const meta: Meta<typeof ChainBuilder> = {
  component: ChainBuilder,
  title: 'Components/ChainBuilder',
  argTypes: {
    tag: { control: 'select', options: ['ul', 'ol'] },
    className: { control: 'text' },
    title: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ChainBuilder>;

export const Default: Story = {
  args: { tag: 'ul', title: 'Shopping List' },
};

export const Ordered: Story = {
  args: { tag: 'ol', title: 'Steps', className: 'steps-list' },
};
