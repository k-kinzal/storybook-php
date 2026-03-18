import type { Meta, StoryObj } from 'storybook-php';
import { PrivateConstruct } from './PrivateConstruct.php@info';

const meta: Meta<typeof PrivateConstruct> = {
  component: PrivateConstruct,
  title: 'Patterns/PrivateConstructInfo',
  argTypes: {
    message: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof PrivateConstruct>;

export const Default: Story = {
  args: { message: 'Your session will expire in 5 minutes.' },
};
