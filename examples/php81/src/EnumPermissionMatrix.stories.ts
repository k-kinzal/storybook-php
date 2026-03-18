import type { Meta, StoryObj } from 'storybook-php';
import { Permission } from './EnumPermission.php@matrix';

const meta: Meta<typeof Permission> = {
  component: Permission,
  title: 'Enums/Permission/Matrix',
};

export default meta;
type Story = StoryObj<typeof Permission>;

export const Default: Story = {};
