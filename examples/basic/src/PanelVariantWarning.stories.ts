import type { Meta, StoryObj } from 'storybook-php';
import { WarningPanel } from './PanelVariant.php@render';

const meta: Meta<typeof WarningPanel> = {
  component: WarningPanel,
  title: 'Components/PanelVariant/Warning',
  argTypes: {
    title: { control: 'text' },
    content: { control: 'text' },
    icon: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof WarningPanel>;

export const Default: Story = {
  args: { title: 'Warning', content: 'This action cannot be undone.' },
};

export const Deprecation: Story = {
  args: { title: 'Deprecated', content: 'This API will be removed in v3.0.', icon: '&#128679;' },
};
