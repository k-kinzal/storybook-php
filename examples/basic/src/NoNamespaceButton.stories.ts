import type { Meta, StoryObj } from 'storybook-php';
import { NoNamespaceButton } from './NoNamespaceButton.php@render';

const meta: Meta<typeof NoNamespaceButton> = {
  component: NoNamespaceButton,
  title: 'Components/NoNamespaceButton',
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'select', options: ['default', 'primary', 'danger'] },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof NoNamespaceButton>;

export const Default: Story = {
  args: { label: 'Click me' },
};

export const Primary: Story = {
  args: { label: 'Submit', variant: 'primary' },
};

export const Disabled: Story = {
  args: { label: 'Disabled', disabled: true },
};
