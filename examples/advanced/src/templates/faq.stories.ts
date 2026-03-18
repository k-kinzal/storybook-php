import type { Meta, StoryObj } from 'storybook-php';
import FaqTemplate from '../templates/faq.php';

const meta: Meta = {
  component: FaqTemplate,
  title: 'Templates/FAQ',
  argTypes: {
    title: { control: 'text' },
    numbered: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    title: 'Frequently Asked Questions',
    items: [
      { question: 'What is storybook-php?', answer: 'A Storybook framework addon for PHP components.' },
      { question: 'Does it support enums?', answer: 'Yes, both backed and unit enums are fully supported.' },
      { question: 'Can I use templates?', answer: 'Absolutely. Plain PHP templates work as default imports.' },
    ],
  },
};

export const Numbered: Story = {
  args: {
    title: 'Setup Guide',
    numbered: true,
    items: [
      { question: 'Install the package', answer: 'Run npm install storybook-php.' },
      { question: 'Create a story file', answer: 'Import your PHP component and define stories.' },
      { question: 'Run Storybook', answer: 'Use npx storybook dev to start.' },
    ],
  },
};

export const Empty: Story = {
  args: { title: 'No Questions Yet', items: [] },
};
