import type { Meta, StoryObj } from 'storybook-php';
import { DangerChip } from './Chip.php@render';

const meta: Meta<typeof DangerChip> = {
  component: DangerChip,
  title: 'Components/Chip/Danger',
  argTypes: {
    label: { control: 'text' },
    removable: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof DangerChip>;

export const Default: Story = {
  args: { label: 'Error' },
};

export const Removable: Story = {
  args: { label: 'Remove this', removable: true },
};
