import type { Meta, StoryObj } from 'storybook-php';
import { UserAvatar } from './UserAvatar.php@circle';

const meta: Meta<typeof UserAvatar> = {
  component: UserAvatar,
  title: 'Components/UserAvatar/Circle',
  argTypes: {
    name: { control: 'text' },
    imageUrl: { control: 'text' },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
  },
};

export default meta;
type Story = StoryObj<typeof UserAvatar>;

export const Initials: Story = {
  args: { name: 'Jane Doe', size: 'md' },
};

export const Small: Story = {
  args: { name: 'Alice', size: 'sm' },
};

export const Large: Story = {
  args: { name: 'Bob Smith', size: 'lg' },
};
