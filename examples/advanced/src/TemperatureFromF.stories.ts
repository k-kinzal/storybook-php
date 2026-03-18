import type { Meta, StoryObj } from 'storybook-php';
import { Temperature } from './Temperature.php@fromFahrenheit';

const meta: Meta<typeof Temperature> = {
  component: Temperature,
  title: 'Components/TemperatureFromF',
};

export default meta;
type Story = StoryObj<typeof Temperature>;

export const BodyTemp: Story = {
  args: { degrees: 98.6 },
};

export const Boiling: Story = {
  args: { degrees: 212 },
};
