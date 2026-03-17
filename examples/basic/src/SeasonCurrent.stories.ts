import type { Meta, StoryObj } from 'storybook-php';
import { Season } from './Season.php@current';

const meta: Meta<typeof Season> = {
  component: Season,
  title: 'Enums/SeasonCurrent',
  argTypes: {
    hemisphere: { control: 'select', options: ['north', 'south'] },
  },
};

export default meta;
type Story = StoryObj<typeof Season>;

export const Northern: Story = {
  args: { hemisphere: 'north' },
};

export const Southern: Story = {
  args: { hemisphere: 'south' },
};
