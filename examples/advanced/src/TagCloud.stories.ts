import type { Meta, StoryObj } from 'storybook-php';
import { TagCloud } from './TagCloud.php@render';

const meta: Meta<typeof TagCloud> = {
  component: TagCloud,
  title: 'Components/TagCloud',
  argTypes: {
    baseSize: { control: 'text' },
    maxWeight: { control: { type: 'number', min: 1, max: 10 } },
    unit: { control: 'select', options: ['px', 'em', 'rem'] },
  },
};

export default meta;
type Story = StoryObj<typeof TagCloud>;

export const SimpleStrings: Story = {
  args: {
    tags: ['PHP', 'TypeScript', 'Storybook', 'Vite', 'React'],
  },
};

export const WeightedTags: Story = {
  args: {
    tags: [
      { label: 'PHP', weight: 5 },
      { label: 'JavaScript', weight: 3 },
      { label: 'TypeScript', weight: 4 },
      { label: 'HTML', weight: 2 },
      { label: 'CSS', weight: 1 },
    ],
  },
};

export const EmptyCloud: Story = {
  args: { tags: [] },
};

export const CustomSize: Story = {
  args: {
    tags: [
      { label: 'Large', weight: 5 },
      { label: 'Medium', weight: 3 },
      { label: 'Small', weight: 1 },
    ],
    baseSize: '18',
    unit: 'px',
    maxWeight: 5,
  },
};
