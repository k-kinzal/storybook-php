import type { Meta, StoryObj } from 'storybook-php';
import { EnumMultiInterface } from './EnumMultiInterface.php@icon';

const meta: Meta<typeof EnumMultiInterface> = {
  component: EnumMultiInterface,
  title: 'Enums/EnumMultiInterfaceIcon',
  argTypes: {
    _case: { control: 'select', options: ['home', 'settings', 'profile', 'logout'] },
  },
};

export default meta;
type Story = StoryObj<typeof EnumMultiInterface>;

export const HomeIcon: Story = {
  args: { _case: 'home' },
};

export const SettingsIcon: Story = {
  args: { _case: 'settings' },
};
