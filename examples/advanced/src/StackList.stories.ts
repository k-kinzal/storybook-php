import type { Meta, StoryObj } from 'storybook-php';
import { StackList } from './StackList.php@render';

const meta: Meta<typeof StackList> = {
  component: StackList,
  title: 'Patterns/StackList',
  argTypes: {
    title: { control: 'text' },
    direction: { control: 'select', options: ['vertical', 'horizontal'] },
  },
};

export default meta;
type Story = StoryObj<typeof StackList>;

export const Vertical: Story = {
  args: { title: 'Todo Items', direction: 'vertical', items: ['Write tests', 'Fix bugs', 'Deploy'] },
};

export const Horizontal: Story = {
  args: { title: 'Tags', direction: 'horizontal', items: ['PHP', 'TypeScript', 'Storybook'] },
};

export const Empty: Story = {
  args: { title: 'Empty Stack' },
};
