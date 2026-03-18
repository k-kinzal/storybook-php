import type { Meta, StoryObj } from 'storybook-php';
import { Compass } from './EnumCompass.php@arrow';

const meta: Meta<typeof Compass> = {
  component: Compass,
  title: 'Enums/CompassArrow',
  argTypes: {
    _case: { control: 'select', options: ['N', 'E', 'S', 'W'] },
  },
};

export default meta;
type Story = StoryObj<typeof Compass>;

export const North: Story = {
  args: { _case: 'N' },
};

export const East: Story = {
  args: { _case: 'E' },
};

export const South: Story = {
  args: { _case: 'S' },
};

export const West: Story = {
  args: { _case: 'W' },
};
