import type { Meta, StoryObj } from 'storybook-php';
import { ObjectInspector } from './ObjectInspector.php@renderIterable';

const meta: Meta<typeof ObjectInspector> = {
  component: ObjectInspector,
  title: 'Patterns/ObjectInspector',
  argTypes: {
    title: { control: 'text' },
    items: { control: 'object' },
    separator: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ObjectInspector>;

export const Default: Story = {
  args: { title: 'Tags', items: ['PHP', 'TypeScript', 'Storybook'], separator: ' | ' },
};

export const Comma: Story = {
  args: { title: 'Languages', items: ['English', 'Japanese', 'French'], separator: ', ' },
};
