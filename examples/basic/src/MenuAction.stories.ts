import type { Meta, StoryObj } from 'storybook-php';
import { MenuAction } from './MenuAction.php@menuItem';

const meta: Meta<typeof MenuAction> = {
  component: MenuAction,
  title: 'Enums/MenuAction/Item',
  argTypes: {
    _case: { control: 'select', options: ['Copy', 'Paste', 'Cut', 'Undo', 'Redo'] },
  },
};

export default meta;
type Story = StoryObj<typeof MenuAction>;

export const Copy: Story = {
  args: { _case: 'Copy' },
};

export const Paste: Story = {
  args: { _case: 'Paste' },
};

export const Undo: Story = {
  args: { _case: 'Undo' },
};
