import type { Meta, StoryObj } from 'storybook-php';
import { Direction } from './Direction.php@render';

const meta: Meta<typeof Direction> = {
  component: Direction,
  title: 'Enums/Direction',
  argTypes: {
    _case: { control: 'select', options: ['up', 'down', 'left', 'right'] },
  },
};

export default meta;
type Story = StoryObj<typeof Direction>;

export const Up: Story = {
  args: { _case: 'up' },
};

export const Down: Story = {
  args: { _case: 'down' },
};

export const Left: Story = {
  args: { _case: 'left' },
};

export const Right: Story = {
  args: { _case: 'right' },
};
