import type { Meta, StoryObj } from 'storybook-php';
import { Language } from './Language.php@greeting';

const meta: Meta<typeof Language> = {
  component: Language,
  title: 'Enums/Language',
  argTypes: {
    _case: { control: 'select', options: ['en', 'ja', 'fr', 'es', 'de'] },
    name: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Language>;

export const English: Story = {
  args: { _case: 'en', name: 'World' },
};

export const Japanese: Story = {
  args: { _case: 'ja', name: '太郎' },
};

export const French: Story = {
  args: { _case: 'fr', name: 'Marie' },
};

export const Spanish: Story = {
  args: { _case: 'es', name: 'Carlos' },
};

export const German: Story = {
  args: { _case: 'de', name: 'Hans' },
};
