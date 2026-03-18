import type { Meta, StoryObj } from 'storybook-php';
import { generateTable } from './generatorFunc.php@generateTable';

const meta: Meta<typeof generateTable> = {
  component: generateTable,
  title: 'Functions/GeneratorTable',
  argTypes: {
    rows: { control: { type: 'range', min: 1, max: 10 } },
    cols: { control: { type: 'range', min: 1, max: 8 } },
  },
};

export default meta;
type Story = StoryObj<typeof generateTable>;

export const Small: Story = {
  args: { rows: 2, cols: 3 },
};

export const Medium: Story = {
  args: { rows: 5, cols: 4 },
};

export const Large: Story = {
  args: { rows: 8, cols: 6 },
};
