import type { Meta, StoryObj } from 'storybook-php';
import { ExpandableList } from './ExpandableList.php@sort';

const meta: Meta<typeof ExpandableList> = {
  component: ExpandableList,
  title: 'Patterns/MultiInterface/Sort',
  argTypes: {
    title: { control: 'text' },
    items: { control: 'object' },
    direction: { control: 'select', options: ['asc', 'desc'] },
  },
};

export default meta;
type Story = StoryObj<typeof ExpandableList>;

export const Ascending: Story = {
  args: { title: 'Fruits', items: ['Cherry', 'Apple', 'Banana', 'Date'] },
};

export const Descending: Story = {
  args: { title: 'Fruits', items: ['Cherry', 'Apple', 'Banana', 'Date'], direction: 'desc' },
};
