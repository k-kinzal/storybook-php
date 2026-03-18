import type { Meta, StoryObj } from 'storybook-php';
import { truncate } from './globalHelpers.php@truncate';

const meta: Meta<typeof truncate> = {
  component: truncate,
  title: 'Functions/Truncate',
  argTypes: {
    text: { control: 'text' },
    length: { control: { type: 'range', min: 10, max: 100 } },
    suffix: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof truncate>;

export const Short: Story = {
  args: { text: 'This is a very long text that should be truncated at some point for display.', length: 30 },
};

export const Long: Story = {
  args: { text: 'A longer truncation limit allows more text to be visible before the ellipsis appears.', length: 60 },
};

export const CustomSuffix: Story = {
  args: { text: 'Read more about this interesting topic in our documentation.', length: 40, suffix: ' [...]' },
};
