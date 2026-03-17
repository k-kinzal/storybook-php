import type { Meta, StoryObj } from 'storybook-php';
import { Callout } from './Callout.php@render';

const meta: Meta<typeof Callout> = {
  component: Callout,
  title: 'Components/Callout',
  argTypes: {
    title: { control: 'text' },
    message: { control: 'text' },
    type: { control: 'select', options: ['info', 'success', 'warning', 'error', 'neutral'] },
    showIcon: { control: 'boolean' },
    bordered: { control: 'boolean' },
    rounded: { control: 'boolean' },
    shadow: { control: 'boolean' },
    closable: { control: 'boolean' },
    compact: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Callout>;

export const Info: Story = {
  args: { title: 'Information', message: 'This is an informational callout for general notices.' },
};

export const Success: Story = {
  args: { title: 'Success', message: 'Your changes have been saved successfully.', type: 'success' },
};

export const Warning: Story = {
  args: { title: 'Warning', message: 'This action cannot be undone.', type: 'warning', closable: true },
};

export const Error: Story = {
  args: { title: 'Error', message: 'Failed to connect to the server.', type: 'error', shadow: true },
};

export const Compact: Story = {
  args: { title: 'Note', message: 'Compact mode for tight layouts.', type: 'neutral', compact: true, bordered: false },
};

export const Minimal: Story = {
  args: { title: 'Minimal', message: 'No icon, no border, no rounding.', showIcon: false, bordered: false, rounded: false },
};
