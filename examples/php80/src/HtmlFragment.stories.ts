import type { Meta, StoryObj } from 'storybook-php';
import { FragmentBuilder } from './HtmlFragment.php@render';

const meta: Meta<typeof FragmentBuilder> = {
  component: FragmentBuilder,
  title: 'Components/FragmentBuilder',
  argTypes: {
    heading: { control: 'text' },
    body: { control: 'text' },
    tag: { control: 'select', options: ['article', 'section', 'div', 'aside'] },
  },
};

export default meta;
type Story = StoryObj<typeof FragmentBuilder>;

export const Article: Story = {
  args: { heading: 'Article Heading', body: 'This demonstrates __toString return handling.', tag: 'article' },
};

export const Section: Story = {
  args: { heading: 'Section Title', body: 'A section fragment.', tag: 'section' },
};

export const HeadingOnly: Story = {
  args: { heading: 'Just a Heading', tag: 'div' },
};
