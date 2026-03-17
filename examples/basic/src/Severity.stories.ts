import type { Meta, StoryObj } from 'storybook-php';
import { Severity } from './Severity.php@label';

const meta: Meta<typeof Severity> = {
  component: Severity,
  title: 'Enums/Severity',
  argTypes: {
    _case: { control: 'select', options: ['info', 'warning', 'error', 'critical'] },
  },
};

export default meta;
type Story = StoryObj<typeof Severity>;

export const Info: Story = {
  args: { _case: 'info' },
};

export const Warning: Story = {
  args: { _case: 'warning' },
};

export const Error: Story = {
  args: { _case: 'error' },
};

export const Critical: Story = {
  args: { _case: 'critical' },
};
