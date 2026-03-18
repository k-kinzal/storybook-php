import type { Meta, StoryObj } from 'storybook-php';
import WeatherTemplate from './weather.php';

const meta: Meta = {
  component: WeatherTemplate,
  title: 'Templates/Weather',
  argTypes: {
    city: { control: 'text' },
    temperature: { control: { type: 'range', min: -20, max: 50, step: 1 } },
    condition: { control: 'select', options: ['sunny', 'cloudy', 'rainy', 'snowy'] },
    humidity: { control: { type: 'range', min: 0, max: 100, step: 5 } },
    windSpeed: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
};

export default meta;
type Story = StoryObj;

export const Sunny: Story = {
  args: { city: 'Tokyo', temperature: 28, condition: 'sunny', humidity: 55, windSpeed: 8 },
};

export const Rainy: Story = {
  args: { city: 'London', temperature: 12, condition: 'rainy', humidity: 85, windSpeed: 20 },
};

export const Snowy: Story = {
  args: { city: 'Helsinki', temperature: -5, condition: 'snowy', humidity: 70, windSpeed: 15 },
};

export const Cloudy: Story = {
  args: { city: 'San Francisco', temperature: 18, condition: 'cloudy', humidity: 65, windSpeed: 25 },
};
