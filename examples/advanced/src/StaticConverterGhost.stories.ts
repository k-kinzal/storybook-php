import type { Meta, StoryObj } from 'storybook-php';
import { StaticConverter } from './StaticConverter.php@ghost';

const meta: Meta<typeof StaticConverter> = {
  component: StaticConverter,
  title: 'Patterns/StaticFactory/Ghost',
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof StaticConverter>;

export const Default: Story = {
  args: { label: 'Ghost Button' },
};

export const Disabled: Story = {
  args: { label: 'Disabled', disabled: true },
};
