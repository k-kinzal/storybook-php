import type { Meta, StoryObj } from 'storybook-php';
import { renderMatrix } from './nestedGrid.php@renderMatrix';

const meta: Meta<typeof renderMatrix> = {
  component: renderMatrix,
  title: 'Functions/NestedMatrix',
  argTypes: {
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof renderMatrix>;

export const Identity: Story = {
  args: { label: 'Identity Matrix' },
};

export const Custom: Story = {
  args: { label: 'Rotation', matrix: [[0, -1], [1, 0]] },
};
