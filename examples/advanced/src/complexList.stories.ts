import type { Meta, StoryObj } from 'storybook-php';
import { complexList } from './complexList.php@complexList';

const meta: Meta<typeof complexList> = {
  component: complexList,
  title: 'Functions/ComplexList',
  argTypes: {
    style: { control: 'select', options: ['disc', 'circle', 'square', 'decimal', 'none'] },
    compact: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof complexList>;

export const Default: Story = {
  args: {},
};

export const CustomItems: Story = {
  args: { items: ['Apples', 'Bananas', 'Cherries'], style: 'circle' },
};

export const Compact: Story = {
  args: { items: ['Step 1', 'Step 2', 'Step 3'], style: 'decimal', compact: true },
};
