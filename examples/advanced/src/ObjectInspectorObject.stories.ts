import type { Meta, StoryObj } from 'storybook-php';
import { ObjectInspector } from './ObjectInspector.php@renderObject';

const meta: Meta<typeof ObjectInspector> = {
  component: ObjectInspector,
  title: 'Patterns/ObjectInspectorObject',
  argTypes: {
    title: { control: 'text' },
    data: { control: 'object' },
    variant: { control: { type: 'select', options: ['default', 'dark'] } },
  },
};

export default meta;
type Story = StoryObj<typeof ObjectInspector>;

export const Default: Story = {
  args: { title: 'User Info', data: { name: 'Alice', role: 'Admin', level: 5 }, variant: 'default' },
};

export const Dark: Story = {
  args: { title: 'Config', data: { host: 'localhost', port: 3000 }, variant: 'dark' },
};
