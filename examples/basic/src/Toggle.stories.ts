import type { Meta, StoryObj } from 'storybook-php';
import { Toggle } from './Toggle.php@render';

const meta: Meta<typeof Toggle> = {
  component: Toggle,
  title: 'Components/Toggle',
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: { label: 'Enable notifications' },
};

export const Checked: Story = {
  args: { label: 'Dark mode', checked: true },
};

export const Disabled: Story = {
  args: { label: 'Premium feature', disabled: true },
};

export const DisabledChecked: Story = {
  args: { label: 'Always on', checked: true, disabled: true },
};

export const Small: Story = {
  args: { label: 'Compact toggle', size: 'small' },
};

export const Large: Story = {
  args: { label: 'Large toggle', size: 'large', checked: true },
};
