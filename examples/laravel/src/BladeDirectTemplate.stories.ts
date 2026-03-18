import type { Meta, StoryObj } from 'storybook-php';
import { BladeDirectTemplate } from './BladeDirectTemplate.php@render';

const meta: Meta<typeof BladeDirectTemplate> = {
  component: BladeDirectTemplate,
  title: 'Laravel/BladeDirectTemplate',
};

export default meta;
type Story = StoryObj<typeof BladeDirectTemplate>;

export const Default: Story = {
  args: { title: 'Welcome', message: 'Hello from Blade!' },
};

export const Custom: Story = {
  args: { title: 'Dashboard', message: 'Your stats are looking great.' },
};
