import type { Meta, StoryObj } from 'storybook-php';
import { Tooltip } from './Tooltip.php@render';

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  title: 'Components/Tooltip',
  argTypes: {
    text: { control: 'text', description: 'Tooltip text' },
    position: { control: 'select', options: ['top', 'bottom', 'left', 'right'], description: 'Position' },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Top: Story = {
  args: { text: 'Helpful tip', position: 'top' },
};

export const Bottom: Story = {
  args: { text: 'More info', position: 'bottom' },
};

export const Right: Story = {
  args: { text: 'Side note', position: 'right' },
};
