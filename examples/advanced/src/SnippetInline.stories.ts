import type { Meta, StoryObj } from 'storybook-php';
import { Snippet } from './Snippet.php@inline';

const meta: Meta<typeof Snippet> = {
  component: Snippet,
  title: 'Components/SnippetInline',
  argTypes: {
    code: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Snippet>;

export const Default: Story = {
  args: { code: '$variable' },
};

export const FunctionCall: Story = {
  args: { code: 'array_map(fn($x) => $x * 2, $items)' },
};
