import type { Meta, StoryObj } from 'storybook-php';
import { PrivateConstruct } from './PrivateConstruct.php@error';

const meta: Meta<typeof PrivateConstruct> = {
  component: PrivateConstruct,
  title: 'Patterns/PrivateConstructError',
  argTypes: {
    message: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof PrivateConstruct>;

export const Default: Story = {
  args: { message: 'Connection timed out.' },
};
