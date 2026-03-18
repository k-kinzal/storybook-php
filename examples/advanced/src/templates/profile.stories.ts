import type { Meta, StoryObj } from 'storybook-php';
import ProfileTemplate from '../templates/profile.php';

const meta: Meta = {
  component: ProfileTemplate,
  title: 'Templates/Profile',
  argTypes: {
    name: { control: 'text' },
    role: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { name: 'Alice Johnson', role: 'Software Engineer' },
};

export const Designer: Story = {
  args: { name: 'Bob Smith', role: 'Product Designer' },
};

export const MinimalInfo: Story = {
  args: { name: 'Charlie' },
};
