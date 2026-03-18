import type { Meta, StoryObj } from 'storybook-php';
import StepsTemplate from './steps.php';

const meta: Meta = {
  component: StepsTemplate,
  title: 'Templates/Steps',
  argTypes: {
    steps: { control: 'object' },
    current: { control: { type: 'number', min: 0 } },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    current: 1,
    steps: [
      { label: 'Account', description: 'Create your account' },
      { label: 'Profile', description: 'Set up your profile' },
      { label: 'Review', description: 'Confirm details' },
      { label: 'Done', description: 'All set!' },
    ],
  },
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    current: 2,
    steps: [
      { label: 'Install', description: 'npm install storybook-php' },
      { label: 'Configure', description: 'Set up .storybook/main.ts' },
      { label: 'Create', description: 'Write your first story' },
      { label: 'Launch', description: 'Run storybook dev' },
    ],
  },
};

export const Completed: Story = {
  args: {
    current: 3,
    steps: [
      { label: 'Step 1' },
      { label: 'Step 2' },
      { label: 'Step 3' },
    ],
  },
};

export const NotStarted: Story = {
  args: {
    current: 0,
    steps: [
      { label: 'First' },
      { label: 'Second' },
      { label: 'Third' },
    ],
  },
};
