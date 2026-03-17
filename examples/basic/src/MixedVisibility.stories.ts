import type { Meta, StoryObj } from 'storybook-php';
import { MixedVisibility } from './MixedVisibility.php@render';

const meta: Meta<typeof MixedVisibility> = {
  component: MixedVisibility,
  title: 'Components/MixedVisibility',
  argTypes: {
    label: { control: 'text', description: 'Display text (public)' },
    variant: { control: 'select', options: ['default', 'primary', 'danger'] },
    maxLength: { control: { type: 'number', min: 10, max: 200 } },
    truncate: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof MixedVisibility>;

export const Default: Story = {
  args: { label: 'Mixed visibility demo' },
};

export const Truncated: Story = {
  args: { label: 'This is a very long label that should be truncated at the max length boundary', truncate: true, maxLength: 30 },
};
