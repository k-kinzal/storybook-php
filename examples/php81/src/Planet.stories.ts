import type { Meta, StoryObj } from 'storybook-php';
import { Planet } from './Planet.php@render';

const meta: Meta<typeof Planet> = {
  component: Planet,
  title: 'Enums/Planet',
  argTypes: {
    _case: { control: 'select', options: ['Mercury', 'Venus', 'Earth', 'Mars'] },
    showDescription: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Planet>;

export const Earth: Story = {
  args: { _case: 'Earth', showDescription: true },
};

export const Mars: Story = {
  args: { _case: 'Mars', showDescription: true },
};

export const Minimal: Story = {
  args: { _case: 'Venus', showDescription: false },
};
