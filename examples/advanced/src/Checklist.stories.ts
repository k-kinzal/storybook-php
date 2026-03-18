import type { Meta, StoryObj } from 'storybook-php';
import { Checklist } from './Checklist.php@render';

const meta: Meta<typeof Checklist> = {
  component: Checklist,
  title: 'Components/Checklist',
  argTypes: {
    title: { control: 'text' },
    numbered: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Checklist>;

export const Default: Story = {
  args: {
    title: 'Todo',
    items: ['Write tests', 'Add examples', 'Run CI'],
  },
};

export const Numbered: Story = {
  args: {
    title: 'Steps',
    items: ['Install PHP', 'Run Storybook', 'Profit'],
    numbered: true,
  },
};

export const Empty: Story = {
  args: { title: 'Empty List' },
};
