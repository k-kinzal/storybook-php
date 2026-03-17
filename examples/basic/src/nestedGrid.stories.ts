import type { Meta, StoryObj } from 'storybook-php';
import { renderGrid } from './nestedGrid.php@renderGrid';

const meta: Meta<typeof renderGrid> = {
  component: renderGrid,
  title: 'Functions/NestedGrid',
  argTypes: {
    title: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof renderGrid>;

export const Default: Story = {
  args: { title: 'Data Grid' },
};

export const Custom: Story = {
  args: { title: 'Custom', rows: [['X', 'Y'], ['1', '2'], ['3', '4']] },
};
