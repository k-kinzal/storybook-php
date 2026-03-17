import type { Meta, StoryObj } from 'storybook-php';
import { Severity } from './Severity.php@banner';

const meta: Meta<typeof Severity> = {
  component: Severity,
  title: 'Enums/SeverityBanner',
  argTypes: {
    _case: { control: 'select', options: ['info', 'warning', 'error', 'critical'] },
    message: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Severity>;

export const InfoBanner: Story = {
  args: { _case: 'info', message: 'This is an informational message.' },
};

export const WarningBanner: Story = {
  args: { _case: 'warning', message: 'Please review before proceeding.' },
};

export const ErrorBanner: Story = {
  args: { _case: 'error', message: 'An error occurred during processing.' },
};

export const CriticalBanner: Story = {
  args: { _case: 'critical', message: 'System failure detected. Immediate action required.' },
};
