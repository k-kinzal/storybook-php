import type { Meta, StoryObj } from 'storybook-php';
import { Rating } from './Rating.php@fromPercent';

const meta: Meta<typeof Rating> = {
  component: Rating,
  title: 'Components/RatingPercent',
  argTypes: {
    percent: { control: { type: 'number', min: 0, max: 100 } },
    max: { control: { type: 'number', min: 1, max: 10 } },
  },
};

export default meta;
type Story = StoryObj<typeof Rating>;

export const Fifty: Story = {
  args: { percent: 50 },
};

export const Eighty: Story = {
  args: { percent: 80 },
};

export const Full: Story = {
  args: { percent: 100, max: 10 },
};
