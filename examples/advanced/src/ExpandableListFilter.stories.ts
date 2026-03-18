import type { Meta, StoryObj } from 'storybook-php';
import { ExpandableList } from './ExpandableList.php@filter';

const meta: Meta<typeof ExpandableList> = {
  component: ExpandableList,
  title: 'Patterns/MultiInterface/Filter',
  argTypes: {
    title: { control: 'text' },
    items: { control: 'object' },
    query: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ExpandableList>;

export const NoFilter: Story = {
  args: { title: 'Languages', items: ['TypeScript', 'Python', 'Rust', 'PHP', 'Go'] },
};

export const Filtered: Story = {
  args: { title: 'Languages', items: ['TypeScript', 'Python', 'Rust', 'PHP', 'Go'], query: 'P' },
};
