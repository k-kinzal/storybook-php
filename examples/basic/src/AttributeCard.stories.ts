import type { Meta, StoryObj } from 'storybook-php';
import { AttributeCard } from './AttributeCard.php@render';

const meta: Meta<typeof AttributeCard> = {
  component: AttributeCard,
  title: 'Components/AttributeCard',
  argTypes: {
    variant: { control: 'select', options: ['default', 'primary', 'success'] },
    elevated: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof AttributeCard>;

export const Default: Story = {
  args: { title: 'Attribute Card', body: 'This component uses PHP 8 attributes on its constructor params.' },
};

export const Primary: Story = {
  args: { title: 'Primary Card', body: 'With primary variant styling.', variant: 'primary' },
};

export const Elevated: Story = {
  args: { title: 'Elevated Card', body: 'Floating with box-shadow.', variant: 'success', elevated: true },
};
