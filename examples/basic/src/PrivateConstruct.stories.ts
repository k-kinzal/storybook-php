import type { Meta, StoryObj } from 'storybook-php';
import { PrivateConstruct } from './PrivateConstruct.php@success';

const meta: Meta<typeof PrivateConstruct> = {
  component: PrivateConstruct,
  title: 'Patterns/PrivateConstructSuccess',
  argTypes: {
    message: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof PrivateConstruct>;

export const Default: Story = {
  args: { message: 'File uploaded successfully.' },
};
