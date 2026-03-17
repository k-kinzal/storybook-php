import type { Meta, StoryObj } from 'storybook-php';
import { Twitter } from './SocialShare.php@shareLink';

const meta: Meta<typeof Twitter> = {
  component: Twitter,
  title: 'Components/SocialShare/Twitter',
  argTypes: {
    url: { control: 'text' },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Twitter>;

export const Default: Story = {
  args: { url: 'https://example.com/post', label: 'Share on X' },
};
