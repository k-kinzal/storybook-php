import type { Meta, StoryObj } from 'storybook-php';
import { Accordion } from './Accordion.php@toggle';

const meta: Meta<typeof Accordion> = {
  component: Accordion,
  title: 'Components/Accordion',
  argTypes: {
    label: { control: 'text', description: 'Toggle label' },
    content: { control: 'text', description: 'Hidden content' },
    open: { control: 'boolean', description: 'Initially open' },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Closed: Story = {
  args: { label: 'Show Details', content: '<p>This is the hidden content.</p>' },
};

export const Open: Story = {
  args: { label: 'FAQ: How does it work?', content: '<p>It uses a trait with a toggle method.</p>', open: true },
};
