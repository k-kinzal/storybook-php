import type { Meta, StoryObj } from 'storybook-php';
import { Widget } from './Widget.php@icon';

const meta: Meta<typeof Widget> = {
  component: Widget,
  title: 'Components/Widget/Icon',
  argTypes: {
    name: { control: 'text', description: 'Icon name' },
    size: { control: { type: 'range', min: 16, max: 64, step: 4 } },
  },
};

export default meta;
type Story = StoryObj<typeof Widget>;

export const Default: Story = {
  args: { title: 'Widget', name: 'star', size: 24 },
};

export const Large: Story = {
  args: { title: 'Widget', name: 'heart', size: 48 },
};
