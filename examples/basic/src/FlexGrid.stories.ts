import type { Meta, StoryObj } from 'storybook-php';
import { FlexGrid } from './FlexGrid.php@render';

const meta: Meta<typeof FlexGrid> = {
  component: FlexGrid,
  title: 'Components/FlexGrid',
  argTypes: {
    columns: { control: { type: 'number', min: 1, max: 6 } },
    gap: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof FlexGrid>;

export const ThreeColumn: Story = {
  args: {
    id: 'demo-grid',
    items: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'],
    columns: 3,
    gap: '16px',
  },
};

export const TwoColumn: Story = {
  args: {
    id: 'two-col',
    items: ['Alpha', 'Beta', 'Gamma', 'Delta'],
    columns: 2,
  },
};

export const Empty: Story = {
  args: { id: 'empty-grid', items: [] },
};
