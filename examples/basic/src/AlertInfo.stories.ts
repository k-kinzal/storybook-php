import type { Meta, StoryObj } from 'storybook-php';
import { Alert } from './Alert.php@info';

const meta: Meta<typeof Alert> = {
  component: Alert,
  title: 'Components/AlertInfo',
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: { message: 'For your information: updates are available.' },
};
