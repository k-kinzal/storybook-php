import type { Meta, StoryObj } from 'storybook-php';
import { UserAvatar } from './UserAvatar.php@card';

const meta: Meta<typeof UserAvatar> = {
  component: UserAvatar,
  title: 'Components/UserAvatar/Card',
  argTypes: {
    name: { control: 'text' },
    email: { control: 'text' },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
  },
};

export default meta;
type Story = StoryObj<typeof UserAvatar>;

export const WithEmail: Story = {
  args: { name: 'Jane Doe', email: 'jane@example.com', size: 'md' },
};

export const NoEmail: Story = {
  args: { name: 'John Smith', size: 'lg' },
};
