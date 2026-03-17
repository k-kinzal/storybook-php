import type { Meta, StoryObj } from 'storybook-php';
import { Season } from './Season.php@grid';

const meta: Meta<typeof Season> = {
  component: Season,
  title: 'Enums/SeasonGrid',
};

export default meta;
type Story = StoryObj<typeof Season>;

export const AllSeasons: Story = {
  args: {},
};
