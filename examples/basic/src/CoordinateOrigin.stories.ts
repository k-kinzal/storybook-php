import type { Meta, StoryObj } from 'storybook-php';
import { Coordinate } from './Coordinate.php@origin';

const meta: Meta<typeof Coordinate> = {
  component: Coordinate,
  title: 'Components/CoordinateOrigin',
  argTypes: {
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Coordinate>;

export const Origin: Story = {
  args: { label: 'Origin' },
};

export const CustomLabel: Story = {
  args: { label: 'Null Island' },
};
