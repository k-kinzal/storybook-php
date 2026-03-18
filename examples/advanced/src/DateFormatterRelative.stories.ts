import type { Meta, StoryObj } from 'storybook-php';
import { DateFormatter } from './DateFormatter.php@relative';

const meta: Meta<typeof DateFormatter> = {
  component: DateFormatter,
  title: 'Components/DateFormatterRelative',
  argTypes: {
    locale: { control: 'select', options: ['en', 'ja', 'de'] },
    date: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof DateFormatter>;

export const Recent: Story = {
  args: { date: '2025-03-14' },
};

export const LastWeek: Story = {
  args: { date: '2025-03-08' },
};

export const LastMonth: Story = {
  args: { date: '2025-02-15' },
};
