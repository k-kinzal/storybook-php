import type { Meta, StoryObj } from 'storybook-php';
import { TagList } from './TagList.php@inline';

const meta: Meta<typeof TagList> = {
  component: TagList,
  title: 'Patterns/TagListInline',
  argTypes: {
    separator: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof TagList>;

export const CommaSeparated: Story = {
  args: { separator: ', ', tags: ['PHP', 'TypeScript', 'Storybook'] },
};

export const PipeSeparated: Story = {
  args: { separator: ' | ', tags: ['Home', 'About', 'Contact'] },
};
