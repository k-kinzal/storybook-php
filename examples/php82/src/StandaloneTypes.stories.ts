import type { Meta, StoryObj } from 'storybook-php';
import { StandaloneTypes } from './StandaloneTypes.php@render';

const meta: Meta<typeof StandaloneTypes> = {
  component: StandaloneTypes,
  title: 'Components/StandaloneTypes',
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'select', options: ['default', 'primary', 'success', 'danger'] },
  },
};

export default meta;
type Story = StoryObj<typeof StandaloneTypes>;

export const Default: Story = {
  args: { label: 'Click Me' },
};

export const Primary: Story = {
  args: { label: 'Submit', variant: 'primary' },
};

export const Success: Story = {
  args: { label: 'Confirm', variant: 'success' },
};
