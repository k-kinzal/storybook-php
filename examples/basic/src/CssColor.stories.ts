import type { Meta, StoryObj } from 'storybook-php';
import { CssColor } from './CssColor.php@render';

const meta: Meta<typeof CssColor> = {
  component: CssColor,
  title: 'Enums/CssColor',
  argTypes: {
    _case: { control: 'select', options: ['#64748b', '#f43f5e', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6'] },
  },
};

export default meta;
type Story = StoryObj<typeof CssColor>;

export const Rose: Story = {
  args: { _case: '#f43f5e' },
};

export const Emerald: Story = {
  args: { _case: '#10b981' },
};

export const Violet: Story = {
  args: { _case: '#8b5cf6' },
};

export const Amber: Story = {
  args: { _case: '#f59e0b' },
};
