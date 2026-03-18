import type { Meta, StoryObj } from 'storybook-php';
import { SectionFooter } from './Sections.php@render';

const meta: Meta<typeof SectionFooter> = {
  component: SectionFooter,
  title: 'Components/SectionFooter',
  argTypes: {
    copyright: { control: 'text', description: 'Copyright holder' },
    year: { control: 'number', description: 'Year' },
  },
};

export default meta;
type Story = StoryObj<typeof SectionFooter>;

export const Default: Story = {
  args: { copyright: 'My Company' },
};

export const Custom: Story = {
  args: { copyright: 'Acme Inc.', year: 2024 },
};
