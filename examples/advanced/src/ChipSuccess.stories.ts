import type { Meta, StoryObj } from 'storybook-php';
import { SuccessChip } from './Chip.php@render';

const meta: Meta<typeof SuccessChip> = {
  component: SuccessChip,
  title: 'Components/Chip/Success',
  argTypes: {
    label: { control: 'text' },
    removable: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof SuccessChip>;

export const Default: Story = {
  args: { label: 'Success' },
};

export const Removable: Story = {
  args: { label: 'Approved', removable: true },
};
