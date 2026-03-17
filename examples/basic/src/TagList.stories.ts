import type { Meta, StoryObj } from 'storybook-php';
import { TagList } from './TagList.php@render';

const meta: Meta<typeof TagList> = {
  component: TagList,
  title: 'Patterns/TagList',
  argTypes: {
    label: { control: 'text' },
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof TagList>;

export const Default: Story = {
  args: { label: 'Skills', color: '#3b82f6', tags: ['PHP', 'TypeScript', 'Storybook'] },
};

export const SingleTag: Story = {
  args: { label: 'Language', tags: ['PHP'] },
};

export const ManyTags: Story = {
  args: { label: 'Categories', color: '#8b5cf6', tags: ['Design', 'Code', 'Test', 'Deploy', 'Monitor'] },
};
