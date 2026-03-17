import type { Meta, StoryObj } from 'storybook-php';
import { Size } from './Size.php@button';

const meta: Meta<typeof Size> = {
  component: Size,
  title: 'Enums/Size',
  argTypes: {
    _case: { control: 'select', options: ['Small', 'Medium', 'Large', 'ExtraLarge'] },
    text: { control: 'text' },
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof Size>;

export const SmallButton: Story = {
  args: { _case: 'Small', text: 'Small' },
};

export const MediumButton: Story = {
  args: { _case: 'Medium', text: 'Medium' },
};

export const LargeButton: Story = {
  args: { _case: 'Large', text: 'Large', color: '#10b981' },
};

export const ExtraLargeButton: Story = {
  args: { _case: 'ExtraLarge', text: 'Extra Large', color: '#ef4444' },
};
