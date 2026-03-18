import type { Meta, StoryObj } from 'storybook-php';
import { CallableLabel } from './CallableLabel.php@render';

const meta: Meta<typeof CallableLabel> = {
  component: CallableLabel,
  title: 'Patterns/CallableLabel',
  argTypes: {
    label: { control: 'text', description: 'Label text' },
    prefix: { control: 'text', description: 'Optional prefix' },
    suffix: { control: 'text', description: 'Optional suffix' },
  },
};

export default meta;
type Story = StoryObj<typeof CallableLabel>;

export const Default: Story = {
  args: { label: 'Hello World' },
};

export const WithPrefix: Story = {
  args: { label: 'Success', prefix: 'Status' },
};

export const WithBoth: Story = {
  args: { label: 'Task', prefix: 'TODO', suffix: '(urgent)' },
};
