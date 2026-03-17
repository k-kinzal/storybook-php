import type { Meta, StoryObj } from 'storybook-php';
import SidebarTemplate from './sidebar.php';

const meta: Meta = {
  component: SidebarTemplate,
  title: 'Templates/Sidebar',
  argTypes: {
    title: { control: 'text' },
    activeItem: { control: 'text' },
    theme: { control: 'select', options: ['light', 'dark'] },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    title: 'Navigation',
    items: ['Dashboard', 'Projects', 'Team', 'Settings'],
    activeItem: 'Dashboard',
  },
};

export const Dark: Story = {
  args: {
    title: 'Menu',
    items: ['Overview', 'Analytics', 'Reports', 'Export'],
    activeItem: 'Analytics',
    theme: 'dark',
  },
};

export const Minimal: Story = {
  args: {
    title: 'Links',
    items: ['Home', 'About'],
  },
};
