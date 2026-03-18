import type { Meta, StoryObj } from 'storybook-php';
import { keyValueList } from './KeyValue.php@keyValueList';

const meta: Meta<typeof keyValueList> = {
  component: keyValueList,
  title: 'Functions/KeyValue',
  argTypes: {
    horizontal: { control: 'boolean' },
    emptyMessage: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof keyValueList>;

export const Default: Story = {
  args: {
    items: { Name: 'John Doe', Email: 'john@example.com', Role: 'Engineer' },
  },
};

export const Horizontal: Story = {
  args: {
    items: { Status: 'Active', Plan: 'Pro', Since: '2023' },
    horizontal: true,
  },
};

export const Empty: Story = {
  args: { items: {}, emptyMessage: 'Nothing to display' },
};
