import type { Meta, StoryObj } from 'storybook-php';
import { Dropdown } from './Dropdown.php@search';

const meta: Meta<typeof Dropdown> = {
  component: Dropdown,
  title: 'Components/DropdownSearch',
  argTypes: {
    label: { control: 'text' },
    items: { control: 'object' },
    query: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

export const AllResults: Story = {
  args: { label: 'Search', items: ['Apple', 'Banana', 'Cherry'] },
};

export const Filtered: Story = {
  args: { label: 'Fruit', items: ['Apple', 'Banana', 'Cherry'], query: 'an' },
};

export const NoResults: Story = {
  args: { label: 'Search', items: ['One', 'Two'], query: 'xyz' },
};
