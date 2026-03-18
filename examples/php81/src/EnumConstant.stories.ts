import type { Meta, StoryObj } from 'storybook-php';
import { EnumConstant } from './EnumConstant.php@badge';

const meta: Meta<typeof EnumConstant> = {
  component: EnumConstant,
  title: 'Enums/EnumConstant',
  argTypes: {
    _case: { control: 'select', options: ['success', 'warning', 'danger'] },
  },
};

export default meta;
type Story = StoryObj<typeof EnumConstant>;

export const Success: Story = {
  args: { _case: 'success' },
};

export const Warning: Story = {
  args: { _case: 'warning' },
};

export const Danger: Story = {
  args: { _case: 'danger' },
};
