import type { Meta, StoryObj } from 'storybook-php';
import { StaticEcho } from './StaticEcho.php@banner';

const meta: Meta<typeof StaticEcho> = {
  component: StaticEcho,
  title: 'Patterns/StaticEcho',
  argTypes: {
    title: { control: 'text' },
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof StaticEcho>;

export const Default: Story = {
  args: { title: 'Welcome Banner' },
};

export const Custom: Story = {
  args: { title: 'Alert!', color: '#ef4444' },
};
