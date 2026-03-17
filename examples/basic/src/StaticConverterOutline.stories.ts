import type { Meta, StoryObj } from 'storybook-php';
import { StaticConverter } from './StaticConverter.php@outline';

const meta: Meta<typeof StaticConverter> = {
  component: StaticConverter,
  title: 'Patterns/StaticFactory/Outline',
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof StaticConverter>;

export const Default: Story = {
  args: { label: 'Outline Button' },
};

export const Disabled: Story = {
  args: { label: 'Disabled', disabled: true },
};
