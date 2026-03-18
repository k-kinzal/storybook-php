import type { Meta, StoryObj } from 'storybook-php';
import { StringableTag } from './StringableTag.php@render';

const meta: Meta<typeof StringableTag> = {
  component: StringableTag,
  title: 'Components/StringableTag',
  argTypes: {
    text: { control: 'text' },
    tag: { control: 'select', options: ['span', 'strong', 'em', 'code', 'mark'] },
    wrapper: { control: 'select', options: ['div', 'p', 'section', 'article'] },
  },
};

export default meta;
type Story = StoryObj<typeof StringableTag>;

export const Default: Story = {
  args: { text: 'Hello World' },
};

export const Strong: Story = {
  args: { text: 'Important text', tag: 'strong' },
};

export const Code: Story = {
  args: { text: 'console.log("hi")', tag: 'code', wrapper: 'p' },
};
