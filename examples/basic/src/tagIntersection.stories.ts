import type { Meta, StoryObj } from 'storybook-php';
import { renderIntersectionTag } from './tagIntersection.php@renderIntersectionTag';

const meta: Meta<typeof renderIntersectionTag> = {
  component: renderIntersectionTag,
  title: 'Functions/IntersectionTag',
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof renderIntersectionTag>;

export const Default: Story = {
  args: { size: 'md' },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Large: Story = {
  args: { size: 'lg' },
};
