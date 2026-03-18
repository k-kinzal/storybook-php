import type { Meta, StoryObj } from 'storybook-php';
import AccordionTemplate from './accordion.php';

const meta: Meta = {
  component: AccordionTemplate,
  title: 'Templates/Accordion',
  argTypes: {
    items: { control: 'object' },
    variant: { control: 'select', options: ['default', 'bordered'] },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    items: [
      { title: 'What is Storybook?', content: 'Storybook is a frontend workshop for building UI components in isolation.' },
      { title: 'Does it work with PHP?', content: 'Yes! storybook-php enables PHP component development with Storybook.' },
      { title: 'How do I get started?', content: 'Install the package and configure your Storybook to use the PHP framework.', open: true },
    ],
  },
};

export const Bordered: Story = {
  args: {
    variant: 'bordered',
    items: [
      { title: 'Features', content: 'Hot reload, type safety, and PHP 8.2+ support.' },
      { title: 'Requirements', content: 'Node.js 20+, PHP 8.2+, Storybook 10.' },
    ],
  },
};

export const Empty: Story = {
  args: { items: [] },
};
