import type { Meta, StoryObj } from 'storybook-php';
import { InfoBox } from './Renderable.php@render';

const meta: Meta<typeof InfoBox> = {
  component: InfoBox,
  title: 'Patterns/Interface/InfoBox',
  argTypes: {
    title: { control: 'text' },
    message: { control: 'text' },
    icon: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof InfoBox>;

export const Default: Story = {
  args: { title: 'Information', message: 'This is an informational message.' },
};

export const CustomIcon: Story = {
  args: { title: 'Tip', message: 'You can customize the icon.', icon: '💡' },
};
