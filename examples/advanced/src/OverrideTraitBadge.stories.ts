import type { Meta, StoryObj } from 'storybook-php';
import { OverrideTrait } from './OverrideTrait.php@badge';

const meta: Meta<typeof OverrideTrait> = {
  component: OverrideTrait,
  title: 'Patterns/OverrideTraitBadge',
  argTypes: {
    title: { control: 'text' },
    variant: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof OverrideTrait>;

export const Default: Story = {
  args: { title: 'Test' },
};
