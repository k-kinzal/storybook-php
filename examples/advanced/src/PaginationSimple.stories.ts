import type { Meta, StoryObj } from 'storybook-php';
import { Pagination } from './Pagination.php@simple';

const meta: Meta<typeof Pagination> = {
  component: Pagination,
  title: 'Components/Pagination/Simple',
  argTypes: {
    total: { control: { type: 'number', min: 1, max: 500 } },
    current: { control: { type: 'number', min: 1, max: 50 } },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const FirstPage: Story = {
  args: { total: 100, current: 1 },
};

export const MiddlePage: Story = {
  args: { total: 100, current: 5 },
};

export const LastPage: Story = {
  args: { total: 30, current: 3 },
};
