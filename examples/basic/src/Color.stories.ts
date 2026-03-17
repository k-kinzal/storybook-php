import type { Meta, StoryObj } from 'storybook-php';
import { Color } from './Color.php@badge';

const meta: Meta<typeof Color> = {
  component: Color,
  title: 'Enums/Color',
  argTypes: {
    _case: { control: 'select', options: ['red', 'blue', 'green', 'purple'] },
  },
};

export default meta;
type Story = StoryObj<typeof Color>;

export const RedBadge: Story = {
  args: { _case: 'red' },
};

export const BlueBadge: Story = {
  args: { _case: 'blue' },
};

export const GreenBadge: Story = {
  args: { _case: 'green' },
};
