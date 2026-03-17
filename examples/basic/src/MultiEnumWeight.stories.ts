import type { Meta, StoryObj } from 'storybook-php';
import { FontWeight } from './MultiEnum.php@preview';

const meta: Meta<typeof FontWeight> = {
  component: FontWeight,
  title: 'Enums/FontWeight',
  argTypes: {
    _case: { control: 'select', options: ['300', '400', '700', '900'] },
    text: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof FontWeight>;

export const Light: Story = {
  args: { _case: '300', text: 'Light weight text' },
};

export const Normal: Story = {
  args: { _case: '400', text: 'Normal weight text' },
};

export const Bold: Story = {
  args: { _case: '700', text: 'Bold weight text' },
};

export const Black: Story = {
  args: { _case: '900', text: 'Black weight text' },
};
