import type { Meta, StoryObj } from 'storybook-php';
import { MixedOutput } from './MixedOutput.php@render';

const meta: Meta<typeof MixedOutput> = {
  component: MixedOutput,
  title: 'Patterns/MixedOutput/Return',
  argTypes: {
    title: { control: 'text' },
    content: { control: 'text' },
    variant: { control: 'select', options: ['info', 'success', 'warning', 'danger'] },
  },
};

export default meta;
type Story = StoryObj<typeof MixedOutput>;

export const Info: Story = {
  args: { title: 'Information', content: 'This uses a return statement.' },
};

export const Success: Story = {
  args: { title: 'Success', content: 'Operation completed.', variant: 'success' },
};
