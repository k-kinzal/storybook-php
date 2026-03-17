import type { Meta, StoryObj } from 'storybook-php';
import { EnumLevel } from './EnumLevel.php@render';

const meta: Meta<typeof EnumLevel> = {
  component: EnumLevel,
  title: 'Enums/EnumLevel',
  argTypes: {
    _case: { control: 'select', options: ['low', 'medium', 'high', 'critical'] },
  },
};

export default meta;
type Story = StoryObj<typeof EnumLevel>;

export const Low: Story = {
  args: { _case: 'low' },
};

export const Medium: Story = {
  args: { _case: 'medium' },
};

export const High: Story = {
  args: { _case: 'high' },
};

export const Critical: Story = {
  args: { _case: 'critical' },
};
