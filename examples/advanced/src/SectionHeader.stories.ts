import type { Meta, StoryObj } from 'storybook-php';
import { SectionHeader } from './Sections.php@render';

const meta: Meta<typeof SectionHeader> = {
  component: SectionHeader,
  title: 'Components/SectionHeader',
  argTypes: {
    title: { control: 'text', description: 'Header text' },
    level: { control: 'select', options: ['h1', 'h2', 'h3', 'h4'], description: 'Heading level' },
  },
};

export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const Default: Story = {
  args: { title: 'Welcome' },
};

export const Subtitle: Story = {
  args: { title: 'Section Title', level: 'h2' },
};
