import type { Meta, StoryObj } from 'storybook-php';
import { Coordinate } from './Coordinate.php@render';

const meta: Meta<typeof Coordinate> = {
  component: Coordinate,
  title: 'Components/Coordinate',
  argTypes: {
    latitude: { control: { type: 'range', min: -90, max: 90, step: 0.01 } },
    longitude: { control: { type: 'range', min: -180, max: 180, step: 0.01 } },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Coordinate>;

export const Default: Story = {
  args: { latitude: 35.6762, longitude: 139.6503, label: 'Tokyo' },
};

export const NewYork: Story = {
  args: { latitude: 40.7128, longitude: -74.006, label: 'New York' },
};

export const Southern: Story = {
  args: { latitude: -33.8688, longitude: 151.2093, label: 'Sydney' },
};

export const NoLabel: Story = {
  args: { latitude: 48.8566, longitude: 2.3522 },
};
