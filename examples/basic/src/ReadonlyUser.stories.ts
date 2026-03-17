import type { Meta, StoryObj } from 'storybook-php';
import { ReadonlyUser } from './ReadonlyUser.php@render';

const meta: Meta<typeof ReadonlyUser> = {
  component: ReadonlyUser,
  title: 'Components/ReadonlyUser',
  argTypes: {
    role: { control: 'select', options: ['admin', 'editor', 'member', 'guest'] },
    age: { control: { type: 'number', min: 18, max: 99 } },
  },
};

export default meta;
type Story = StoryObj<typeof ReadonlyUser>;

export const Admin: Story = {
  args: { name: 'Alice Chen', email: 'alice@example.com', age: 34, role: 'admin' },
};

export const Member: Story = {
  args: { name: 'Bob Smith', email: 'bob@example.com', age: 28, role: 'member' },
};

export const Guest: Story = {
  args: { name: 'Charlie', email: 'charlie@example.com', role: 'guest' },
};
