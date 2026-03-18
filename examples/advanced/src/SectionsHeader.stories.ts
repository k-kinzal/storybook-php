import type { Meta, StoryObj } from 'storybook-php';
import { SectionHeader } from './Sections.php@render';

const meta: Meta<typeof SectionHeader> = {
  component: SectionHeader,
  title: 'Components/Sections/Header',
  argTypes: {
    title: { control: 'text' },
    level: { control: 'select', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
  },
};

export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const H1: Story = {
  args: { title: 'Page Title', level: 'h1' },
};

export const H2: Story = {
  args: { title: 'Section Title', level: 'h2' },
};

export const H3: Story = {
  args: { title: 'Subsection Title', level: 'h3' },
};
