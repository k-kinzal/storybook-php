import type { Meta, StoryObj } from 'storybook-php';
import ListTemplate from '../templates/list.php';

const meta: Meta = {
  component: ListTemplate,
  title: 'Templates/List',
  argTypes: {
    title: { control: 'text' },
    numbered: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { title: 'Shopping List', items: ['Milk', 'Eggs', 'Bread'] },
};

export const Numbered: Story = {
  args: { title: 'Steps', items: ['Install', 'Configure', 'Deploy'], numbered: true },
};

export const Empty: Story = {
  args: { title: 'Empty List' },
};
