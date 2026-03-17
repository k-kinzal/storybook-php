import type { Meta, StoryObj } from 'storybook-php';
import { Avatar } from './Avatar.php@render';

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  title: 'Components/Avatar',
  argTypes: {
    name: { control: 'text' },
    size: { control: { type: 'number', min: 24, max: 128 } },
    imageUrl: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: { name: 'John Doe' },
};

export const WithImage: Story = {
  args: { name: 'Jane Smith', imageUrl: 'https://i.pravatar.cc/96', size: 96 },
};

export const SmallAvatar: Story = {
  args: { name: 'AB', size: 32 },
};

export const LargeAvatar: Story = {
  args: { name: 'Claude AI', size: 128 },
};
