import type { Meta, StoryObj } from 'storybook-php';
import { RichWidget } from './TraitAccordion.php@tooltip';

const meta: Meta<typeof RichWidget> = {
  component: RichWidget,
  title: 'Patterns/TraitTooltip',
  argTypes: {
    text: { control: 'text' },
    tip: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof RichWidget>;

export const Default: Story = {
  args: { text: 'Hover over me', tip: 'This is a tooltip!' },
};

export const LongTip: Story = {
  args: { text: 'Important term', tip: 'This term refers to a core concept in the domain model.' },
};
