import type { Meta, StoryObj } from 'storybook-php';
import { Facebook } from './SocialShare.php@shareLink';

const meta: Meta<typeof Facebook> = {
  component: Facebook,
  title: 'Components/FacebookShare',
  argTypes: {
    url: { control: 'text' },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Facebook>;

export const Default: Story = {
  args: { url: 'https://example.com', label: 'Share' },
};

export const CustomLabel: Story = {
  args: { url: 'https://example.com/post', label: 'Post to Facebook' },
};
