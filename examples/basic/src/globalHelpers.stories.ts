import type { Meta, StoryObj } from 'storybook-php';
import { highlight } from './globalHelpers.php@highlight';

const meta: Meta<typeof highlight> = {
  component: highlight,
  title: 'Functions/Highlight',
  argTypes: {
    text: { control: 'text' },
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof highlight>;

export const Default: Story = {
  args: { text: 'Important text' },
};

export const CustomColor: Story = {
  args: { text: 'Warning message', color: '#fca5a5' },
};

export const GreenHighlight: Story = {
  args: { text: 'Success!', color: '#bbf7d0' },
};
