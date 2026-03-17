import type { Meta, StoryObj } from 'storybook-php';
import TimelineTemplate from './timeline.php';

const meta: Meta<typeof TimelineTemplate> = {
  component: TimelineTemplate,
  title: 'Templates/Timeline',
  argTypes: {
    title: { control: 'text' },
    eventCount: { control: { type: 'range', min: 1, max: 10 } },
    theme: { control: 'select', options: ['light', 'dark'] },
  },
};

export default meta;
type Story = StoryObj<typeof TimelineTemplate>;

export const Default: Story = {
  args: { title: 'Activity Timeline', eventCount: 5 },
};

export const Full: Story = {
  args: { title: 'Deployment Pipeline', eventCount: 10 },
};

export const Minimal: Story = {
  args: { title: 'Recent', eventCount: 2 },
};

export const Dark: Story = {
  args: { title: 'Activity Feed', eventCount: 6, theme: 'dark' },
};
