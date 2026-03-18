import type { Meta, StoryObj } from 'storybook-php';
import { InvocableGreeting } from './InvocableGreeting.php@__invoke';

const meta: Meta<typeof InvocableGreeting> = {
  component: InvocableGreeting,
  title: 'Components/InvocableGreeting',
  argTypes: {
    locale: { control: 'select', options: ['en', 'ja', 'fr'] },
    name: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof InvocableGreeting>;

export const English: Story = {
  args: { locale: 'en', name: 'World' },
};

export const Japanese: Story = {
  args: { locale: 'ja', name: '太郎' },
};

export const French: Story = {
  args: { locale: 'fr', name: 'Marie' },
};
