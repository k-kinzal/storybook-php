import type { Meta, StoryObj } from 'storybook-php';
import { FluentBuilder } from './FluentBuilder.php@heading';

const meta: Meta<typeof FluentBuilder> = {
  component: FluentBuilder,
  title: 'Components/FluentBuilder/Heading',
  argTypes: {
    text: { control: 'text' },
    level: { control: { type: 'range', min: 1, max: 6, step: 1 } },
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof FluentBuilder>;

export const Default: Story = {
  args: { text: 'Page Title', level: 2 },
};

export const Subtitle: Story = {
  args: { text: 'Section Subtitle', level: 4, color: '#6b7280' },
};
