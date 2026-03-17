import type { Meta, StoryObj } from 'storybook-php';
import { BoolToggle } from './BoolToggle.php@renderDisabled';

const meta: Meta<typeof BoolToggle> = {
  component: BoolToggle,
  title: 'Components/BoolToggle/Disabled',
  argTypes: {
    label: { control: 'text' },
    inactiveColor: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof BoolToggle>;

export const Default: Story = {
  args: { label: 'Maintenance Mode' },
};

export const CustomColor: Story = {
  args: { label: 'Legacy Feature', inactiveColor: '#f59e0b' },
};
