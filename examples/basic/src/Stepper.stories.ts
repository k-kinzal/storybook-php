import type { Meta, StoryObj } from 'storybook-php';
import { Stepper } from './Stepper.php@render';

const meta: Meta<typeof Stepper> = {
  component: Stepper,
  title: 'Components/Stepper',
  argTypes: {
    current: { control: { type: 'number', min: 0, max: 5 } },
  },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

export const FirstStep: Story = {
  args: {
    current: 1,
    steps: ['Cart', 'Shipping', 'Payment', 'Confirm'],
  },
};

export const ThirdStep: Story = {
  args: {
    current: 3,
    steps: ['Cart', 'Shipping', 'Payment', 'Confirm'],
  },
};

export const Complete: Story = {
  args: {
    current: 4,
    steps: ['Cart', 'Shipping', 'Payment', 'Confirm'],
  },
};

export const Empty: Story = {
  args: { current: 1, steps: [] },
};
