import type { Meta, StoryObj } from 'storybook-php';
import { LogLevel } from './LogLevel.php@entry';

const meta: Meta<typeof LogLevel> = {
  component: LogLevel,
  title: 'Enums/LogLevelEntry',
  argTypes: {
    _case: { control: 'select', options: ['debug', 'info', 'warning', 'error', 'critical'] },
    message: { control: 'text' },
    timestamp: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof LogLevel>;

export const InfoEntry: Story = {
  args: { _case: 'info', message: 'Application started successfully', timestamp: '2025-01-15 10:30:00' },
};

export const ErrorEntry: Story = {
  args: { _case: 'error', message: 'Failed to connect to database', timestamp: '2025-01-15 10:30:05' },
};

export const DebugNoTimestamp: Story = {
  args: { _case: 'debug', message: 'Cache miss for key "user:42"' },
};
