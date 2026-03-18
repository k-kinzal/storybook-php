import type { Meta, StoryObj } from 'storybook-php';
import { NowdocCard } from './NowdocCard.php@render';

const meta: Meta<typeof NowdocCard> = {
  component: NowdocCard,
  title: 'Components/NowdocCard',
  argTypes: {
    title: { control: 'text' },
    body: { control: 'text' },
    variant: { control: 'select', options: ['default', 'primary', 'success', 'warning'] },
  },
};

export default meta;
type Story = StoryObj<typeof NowdocCard>;

export const Default: Story = {
  args: { title: 'Nowdoc Example', body: 'This card uses nowdoc syntax for its template.' },
};

export const Primary: Story = {
  args: { title: 'Primary Card', body: 'A blue primary variant.', variant: 'primary' },
};

export const Success: Story = {
  args: { title: 'Success', body: 'Operation completed successfully.', variant: 'success' },
};

export const Warning: Story = {
  args: { title: 'Warning', body: 'Please review before proceeding.', variant: 'warning' },
};
