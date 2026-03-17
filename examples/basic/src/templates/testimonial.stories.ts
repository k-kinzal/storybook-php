import type { Meta, StoryObj } from 'storybook-php';
import TestimonialTemplate from './testimonial.php';

const meta: Meta = {
  component: TestimonialTemplate,
  title: 'Templates/Testimonial',
  argTypes: {
    quote: { control: 'text' },
    author: { control: 'text' },
    role: { control: 'text' },
    rating: { control: { type: 'range', min: 0, max: 5 } },
    variant: { control: 'select', options: ['card', 'minimal'] },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    quote: 'Storybook for PHP changed how we build components. Highly recommended!',
    author: 'Sarah Chen',
    role: 'Lead Developer',
    rating: 5,
  },
};

export const FourStars: Story = {
  args: {
    quote: 'Great tool with a solid developer experience.',
    author: 'Marco Rossi',
    role: 'Frontend Engineer',
    rating: 4,
  },
};

export const Minimal: Story = {
  args: {
    quote: 'Simple yet powerful.',
    author: 'Alex Kim',
    variant: 'minimal',
  },
};

export const NoRole: Story = {
  args: {
    quote: 'Works exactly as advertised.',
    author: 'Pat Taylor',
    rating: 5,
  },
};
