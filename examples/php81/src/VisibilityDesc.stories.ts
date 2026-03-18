import type { Meta, StoryObj } from 'storybook-php';
import { Visibility } from './Visibility.php@description';

const meta: Meta<typeof Visibility> = {
  component: Visibility,
  title: 'Enums/Visibility/Description',
  argTypes: {
    _case: { control: 'select', options: ['public', 'private', 'unlisted', 'draft'] },
  },
};

export default meta;
type Story = StoryObj<typeof Visibility>;

export const Public: Story = {
  args: { _case: 'public' },
};

export const Private: Story = {
  args: { _case: 'private' },
};
