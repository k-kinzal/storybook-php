import type { Meta, StoryObj } from 'storybook-php';
import { Palette } from './EnumInterfaceTrait.php@swatch';

const meta: Meta<typeof Palette> = {
  component: Palette,
  title: 'Enums/Palette',
  argTypes: {
    _case: { control: 'select', options: ['red', 'green', 'blue', 'yellow'] },
    size: { control: 'select', options: ['32px', '48px', '64px'] },
  },
};

export default meta;
type Story = StoryObj<typeof Palette>;

export const Red: Story = {
  args: { _case: 'red' },
};

export const Blue: Story = {
  args: { _case: 'blue', size: '64px' },
};

export const Green: Story = {
  args: { _case: 'green', size: '32px' },
};

export const Yellow: Story = {
  args: { _case: 'yellow' },
};
