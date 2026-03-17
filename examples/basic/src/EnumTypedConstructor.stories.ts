import type { Meta, StoryObj } from 'storybook-php';
import { EnumTypedConstructor } from './EnumTypedConstructor.php@render';

const meta: Meta<typeof EnumTypedConstructor> = {
  component: EnumTypedConstructor,
  title: 'Components/EnumTypedConstructor',
  argTypes: {
    content: { control: 'text' },
    theme: { control: 'select', options: ['light', 'dark', 'system'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof EnumTypedConstructor>;

export const Light: Story = {
  args: { content: 'Light theme content', theme: 'light' },
};

export const Dark: Story = {
  args: { content: 'Dark theme content', theme: 'dark' },
};

export const System: Story = {
  args: { content: 'System theme content', theme: 'system', size: 'lg' },
};
