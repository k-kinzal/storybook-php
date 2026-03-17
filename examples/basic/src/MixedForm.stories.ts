import type { Meta, StoryObj } from 'storybook-php';
import { MixedForm } from './MixedForm.php@render';

const meta: Meta<typeof MixedForm> = {
  component: MixedForm,
  title: 'Patterns/MixedForm',
  argTypes: {
    label: { control: 'text' },
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'url'] },
    required: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof MixedForm>;

export const TextInput: Story = {
  args: { label: 'Username', placeholder: 'Enter your username', required: true },
};

export const EmailInput: Story = {
  args: { label: 'Email Address', type: 'email', placeholder: 'you@example.com', required: true },
};

export const PasswordInput: Story = {
  args: { label: 'Password', type: 'password', required: true },
};

export const Optional: Story = {
  args: { label: 'Nickname', placeholder: 'Optional nickname', required: false },
};
