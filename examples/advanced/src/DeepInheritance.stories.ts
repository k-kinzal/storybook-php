import type { Meta, StoryObj } from 'storybook-php';
import { DetailWidget } from './DeepInheritance.php@render';

const meta: Meta<typeof DetailWidget> = {
  component: DetailWidget,
  title: 'Patterns/DeepInheritance',
  argTypes: {
    title: { control: 'text' },
    theme: { control: 'select', options: ['light', 'dark', 'accent'] },
    message: { control: 'text' },
    footer: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof DetailWidget>;

export const Light: Story = {
  args: { title: 'Detail Widget', message: 'Three levels of inheritance.', footer: 'BaseWidget > InfoWidget > DetailWidget' },
};

export const Dark: Story = {
  args: { title: 'Dark Theme', theme: 'dark', message: 'Using dark theme from base class.', footer: 'Inherited theming' },
};

export const Accent: Story = {
  args: { title: 'Accent Theme', theme: 'accent', message: 'Blue accent style.', footer: '' },
};
