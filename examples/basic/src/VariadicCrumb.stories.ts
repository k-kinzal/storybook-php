import type { Meta, StoryObj } from 'storybook-php';
import { VariadicCrumb } from './VariadicCrumb.php@render';

const meta: Meta<typeof VariadicCrumb> = {
  component: VariadicCrumb,
  title: 'Patterns/VariadicCrumb',
  argTypes: {
    separator: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof VariadicCrumb>;

export const ThreeSegments: Story = {
  args: { segments: ['Home', 'Products', 'Widget'], separator: ' / ' },
};

export const ArrowSeparator: Story = {
  args: { segments: ['Dashboard', 'Settings', 'Profile'], separator: ' → ' },
};

export const SingleSegment: Story = {
  args: { segments: ['Home'] },
};

export const Empty: Story = {
  args: {},
};
