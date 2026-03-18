import type { Meta, StoryObj } from 'storybook-php';
import { EchoLayout } from './EchoLayout.php@render';

const meta: Meta<typeof EchoLayout> = {
  component: EchoLayout,
  title: 'Components/EchoLayout',
  argTypes: {
    title: { control: 'text' },
    theme: { control: 'select', options: ['light', 'dark'] },
    footer: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof EchoLayout>;

export const Light: Story = {
  args: { title: 'My Application' },
};

export const Dark: Story = {
  args: { title: 'Dark Mode', theme: 'dark' },
};

export const WithFooter: Story = {
  args: { title: 'Full Layout', footer: '© 2025 My Company' },
};
