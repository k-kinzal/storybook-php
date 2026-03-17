import type { Meta, StoryObj } from 'storybook-php';
import { MarkupHelper } from './MarkupHelper.php@link';

const meta: Meta<typeof MarkupHelper> = {
  component: MarkupHelper,
  title: 'Utilities/MarkupHelper/Link',
  argTypes: {
    text: { control: 'text' },
    href: { control: 'text' },
    external: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof MarkupHelper>;

export const Internal: Story = {
  args: { text: 'Home', href: '/' },
};

export const External: Story = {
  args: { text: 'GitHub', href: 'https://github.com', external: true },
};
