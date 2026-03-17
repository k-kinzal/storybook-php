import type { Meta, StoryObj } from 'storybook-php';
import { WarningBox } from './Renderable.php@render';

const meta: Meta<typeof WarningBox> = {
  component: WarningBox,
  title: 'Components/WarningBox',
  argTypes: {
    title: { control: 'text' },
    message: { control: 'text' },
    urgent: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof WarningBox>;

export const Default: Story = {
  args: { title: 'Warning', message: 'Please review your settings.' },
};

export const Urgent: Story = {
  args: { title: 'Critical', message: 'Immediate action required!', urgent: true },
};
