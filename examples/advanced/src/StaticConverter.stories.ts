import type { Meta, StoryObj } from 'storybook-php';
import { StaticConverter } from './StaticConverter.php@primary';

const meta: Meta<typeof StaticConverter> = {
  component: StaticConverter,
  title: 'Patterns/StaticFactory/Primary',
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof StaticConverter>;

export const Default: Story = {
  args: { label: 'Primary Button' },
};

export const Disabled: Story = {
  args: { label: 'Disabled', disabled: true },
};
