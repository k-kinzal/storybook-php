import type { Meta, StoryObj } from 'storybook-php';
import { HttpStatus } from './HttpStatus.php@page';

const meta: Meta<typeof HttpStatus> = {
  component: HttpStatus,
  title: 'Enums/HttpStatus/Page',
  argTypes: {
    _case: { control: 'select', options: [200, 201, 400, 404, 500] },
    message: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof HttpStatus>;

export const NotFound: Story = {
  args: { _case: 404 },
};

export const ServerError: Story = {
  args: { _case: 500, message: 'Please try again later.' },
};

export const Created: Story = {
  args: { _case: 201 },
};
