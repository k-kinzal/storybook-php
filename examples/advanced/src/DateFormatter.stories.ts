import type { Meta, StoryObj } from 'storybook-php';
import { DateFormatter } from './DateFormatter.php@format';

const meta: Meta<typeof DateFormatter> = {
  component: DateFormatter,
  title: 'Components/DateFormatter',
  argTypes: {
    locale: { control: 'select', options: ['en', 'ja', 'de'] },
    date: { control: 'text' },
    style: { control: 'select', options: ['short', 'medium', 'long'] },
  },
};

export default meta;
type Story = StoryObj<typeof DateFormatter>;

export const Medium: Story = {
  args: { date: '2025-03-15', style: 'medium' },
};

export const Short: Story = {
  args: { date: '2025-12-25', style: 'short' },
};

export const Long: Story = {
  args: { date: '2025-01-01', style: 'long' },
};

export const Japanese: Story = {
  args: { date: '2025-07-20', style: 'long', locale: 'ja' },
};
