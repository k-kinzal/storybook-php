import type { Meta, StoryObj } from 'storybook-php';
import { Countdown } from './Countdown.php@render';

const meta: Meta<typeof Countdown> = {
  component: Countdown,
  title: 'Components/Countdown',
  argTypes: {
    from: { control: { type: 'number', min: 1, max: 20 } },
    finishMessage: { control: 'text' },
    showZero: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Countdown>;

export const Default: Story = {
  args: { from: 10, finishMessage: 'Done!' },
};

export const Short: Story = {
  args: { from: 3, finishMessage: 'Go!', showZero: false },
};
