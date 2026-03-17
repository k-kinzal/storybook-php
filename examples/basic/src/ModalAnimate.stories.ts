import type { Meta, StoryObj } from 'storybook-php';
import { Modal } from './Modal.php@animate';

const meta: Meta<typeof Modal> = {
  component: Modal,
  title: 'Components/Modal/Animate',
  argTypes: {
    content: { control: 'text' },
    effect: { control: 'select', options: ['fade', 'slide', 'bounce'] },
    duration: { control: { type: 'number', min: 100, max: 2000 } },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Fade: Story = {
  args: { title: 'Modal', content: '<p>Fading in...</p>' },
};

export const Slide: Story = {
  args: { title: 'Modal', content: '<p>Sliding in!</p>', effect: 'slide', duration: 500 },
};

export const Bounce: Story = {
  args: { title: 'Modal', content: '<p>Bouncing!</p>', effect: 'bounce', duration: 800 },
};
