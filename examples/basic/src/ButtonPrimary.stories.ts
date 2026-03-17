import type { Meta, StoryObj } from 'storybook-php';
import { Button } from './Button.php@primary';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Components/Button/Primary',
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { label: 'Primary Button' },
};

export const Disabled: Story = {
  args: { label: 'Disabled Primary', disabled: true },
};
