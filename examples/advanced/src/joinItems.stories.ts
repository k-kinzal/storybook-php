import type { Meta, StoryObj } from 'storybook-php';
import { joinItems } from './joinItems.php@joinItems';

const meta: Meta<typeof joinItems> = {
  component: joinItems,
  title: 'Functions/JoinItems',
  argTypes: {
    separator: { control: 'text' },
    items: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<typeof joinItems>;

export const Default: Story = {
  args: { separator: ', ', items: ['Apple', 'Banana', 'Cherry'] },
};

export const PipeSeparated: Story = {
  args: { separator: ' | ', items: ['Home', 'About', 'Contact'] },
};

export const ArrowSeparated: Story = {
  args: { separator: ' → ', items: ['Draft', 'Review', 'Published'] },
};

export const Empty: Story = {
  args: { separator: ', ', items: [] },
};
