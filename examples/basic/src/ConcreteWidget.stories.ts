import type { Meta, StoryObj } from 'storybook-php';
import { ConcreteWidget } from './ConcreteWidget.php@render';

const meta: Meta<typeof ConcreteWidget> = {
  component: ConcreteWidget,
  title: 'Patterns/TraitInterfaceHierarchy',
  argTypes: {
    title: { control: 'text' },
    variant: { control: 'select', options: ['default', 'primary', 'success', 'danger'] },
    content: { control: 'text' },
    icon: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ConcreteWidget>;

export const Default: Story = {
  args: { title: 'Widget', content: 'Resolved through interface + trait + abstract hierarchy.' },
};

export const Primary: Story = {
  args: { title: 'Primary Widget', variant: 'primary', content: 'Uses trait method for container wrapping.', icon: '🔵' },
};

export const Success: Story = {
  args: { title: 'Success Widget', variant: 'success', content: 'Abstract base provides variant colors.', icon: '✅' },
};

export const Danger: Story = {
  args: { title: 'Alert Widget', variant: 'danger', content: 'Concrete class implements Displayable interface.', icon: '⚠️' },
};
