import type { Meta, StoryObj } from 'storybook-php';
import { BoolToggle } from './BoolToggle.php@renderEnabled';

const meta: Meta<typeof BoolToggle> = {
  component: BoolToggle,
  title: 'Components/BoolToggle/Enabled',
  argTypes: {
    label: { control: 'text' },
    activeColor: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof BoolToggle>;

export const Default: Story = {
  args: { label: 'Dark Mode' },
};

export const CustomColor: Story = {
  args: { label: 'Notifications', activeColor: '#3b82f6' },
};
