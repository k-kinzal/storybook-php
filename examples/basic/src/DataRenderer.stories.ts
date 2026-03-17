import type { Meta, StoryObj } from 'storybook-php';
import { DataRenderer } from './DataRenderer.php@render';

const meta: Meta<typeof DataRenderer> = {
  component: DataRenderer,
  title: 'Components/DataRenderer',
  argTypes: {
    wrapper: { control: 'select', options: ['div', 'section', 'ul'] },
    transform: { control: 'select', options: [null, 'upper', 'lower', 'reverse'] },
  },
};

export default meta;
type Story = StoryObj<typeof DataRenderer>;

export const Default: Story = {
  args: {
    items: ['Alpha', 'Bravo', 'Charlie'],
  },
};

export const Uppercase: Story = {
  args: {
    items: ['hello', 'world'],
    transform: 'upper',
  },
};

export const Reversed: Story = {
  args: {
    items: ['Storybook', 'PHP'],
    transform: 'reverse',
  },
};

export const Empty: Story = {
  args: { items: [] },
};

export const WithSection: Story = {
  args: {
    items: ['Item One', 'Item Two', 'Item Three'],
    wrapper: 'section',
  },
};
