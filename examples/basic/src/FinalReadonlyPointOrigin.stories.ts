import type { Meta, StoryObj } from 'storybook-php';
import { Point } from './FinalReadonlyPoint.php@origin';

const meta: Meta<typeof Point> = {
  component: Point,
  title: 'PHP82/FinalReadonlyClass/Origin',
};

export default meta;
type Story = StoryObj<typeof Point>;

export const Origin: Story = {};
