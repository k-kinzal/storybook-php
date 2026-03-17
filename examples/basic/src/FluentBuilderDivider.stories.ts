import type { Meta, StoryObj } from 'storybook-php';
import { FluentBuilder } from './FluentBuilder.php@divider';

const meta: Meta<typeof FluentBuilder> = {
  component: FluentBuilder,
  title: 'Components/FluentBuilder/Divider',
  argTypes: {
    style: { control: 'select', options: ['solid', 'dashed', 'dotted'] },
    color: { control: 'color' },
    spacing: { control: { type: 'range', min: 0, max: 48, step: 4 } },
  },
};

export default meta;
type Story = StoryObj<typeof FluentBuilder>;

export const Solid: Story = {
  args: { style: 'solid' },
};

export const Dashed: Story = {
  args: { style: 'dashed', color: '#3b82f6' },
};

export const Dotted: Story = {
  args: { style: 'dotted', spacing: 24 },
};
