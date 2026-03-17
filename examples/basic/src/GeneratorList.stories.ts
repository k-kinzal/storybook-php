import type { Meta, StoryObj } from 'storybook-php';
import { GeneratorList } from './GeneratorList.php@render';

const meta: Meta<typeof GeneratorList> = {
  component: GeneratorList,
  title: 'Patterns/GeneratorList',
  argTypes: {
    title: { control: 'text' },
    count: { control: { type: 'range', min: 1, max: 10 } },
    variant: { control: 'select', options: ['bullet', 'ordered', 'none'] },
  },
};

export default meta;
type Story = StoryObj<typeof GeneratorList>;

export const Bullet: Story = {
  args: { title: 'Todo List', count: 4, variant: 'bullet' },
};

export const Ordered: Story = {
  args: { title: 'Steps', count: 5, variant: 'ordered' },
};

export const NoMarkers: Story = {
  args: { title: 'Plain', count: 3, variant: 'none' },
};

export const SingleItem: Story = {
  args: { title: 'Just One', count: 1 },
};
