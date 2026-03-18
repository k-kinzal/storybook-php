import type { Meta, StoryObj } from 'storybook-php';
import { EnumMethodParams } from './EnumMethodParams.php@render';

const meta: Meta<typeof EnumMethodParams> = {
  component: EnumMethodParams,
  title: 'Enums/EnumMethodParams',
  argTypes: {
    _case: { control: 'select', options: ['badge', 'pill', 'tag'] },
    label: { control: 'text' },
    color: { control: 'color' },
    size: { control: { type: 'number', min: 10, max: 24 } },
    rounded: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof EnumMethodParams>;

export const Badge: Story = {
  args: { _case: 'badge', label: 'New' },
};

export const Pill: Story = {
  args: { _case: 'pill', label: 'Active', color: '#22c55e' },
};

export const Tag: Story = {
  args: { _case: 'tag', label: 'v2.0', color: '#f59e0b', size: 12 },
};
