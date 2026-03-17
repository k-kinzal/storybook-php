import type { Meta, StoryObj } from 'storybook-php';
import { tag } from './helpers.php@tag';

const meta: Meta<typeof tag> = {
  component: tag,
  title: 'Functions/Tag',
  argTypes: {
    label: { control: 'text' },
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof tag>;

export const Default: Story = {
  args: { label: 'Feature' },
};

export const Red: Story = {
  args: { label: 'Bug', color: 'red' },
};

export const Green: Story = {
  args: { label: 'Done', color: 'green' },
};
