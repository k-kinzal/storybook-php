import type { Meta, StoryObj } from 'storybook-php';
import { SectionFooter } from './Sections.php@render';

const meta: Meta<typeof SectionFooter> = {
  component: SectionFooter,
  title: 'Components/Sections/Footer',
  argTypes: {
    copyright: { control: 'text' },
    year: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof SectionFooter>;

export const Default: Story = {
  args: { copyright: 'Acme Inc.', year: 2025 },
};
