import type { Meta, StoryObj } from 'storybook-php';
import kanban from './kanban.php';

const meta: Meta<typeof kanban> = {
  component: kanban,
  title: 'Templates/Kanban',
};

export default meta;
type Story = StoryObj<typeof kanban>;

export const Default: Story = {
  args: { boardTitle: 'Project Board' },
};

export const Custom: Story = {
  args: {
    boardTitle: 'Sprint 12',
    columns: [
      { title: 'Backlog', cards: ['Research', 'Design'] },
      { title: 'Active', cards: ['Parser', 'Runner', 'Plugin'] },
      { title: 'Review', cards: ['Tests'] },
      { title: 'Done', cards: ['Docs'] },
    ],
  },
};

export const Compact: Story = {
  args: { boardTitle: 'Minimal', compact: true, showCounts: false },
};
