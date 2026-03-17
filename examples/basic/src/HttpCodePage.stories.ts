import type { Meta, StoryObj } from 'storybook-php';
import { HttpCode } from './HttpCode.php@page';

const meta: Meta<typeof HttpCode> = {
  component: HttpCode,
  title: 'Enums/HttpCode/Page',
  argTypes: {
    _case: { control: 'select', options: [200, 201, 400, 404, 500] },
    message: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof HttpCode>;

export const NotFoundPage: Story = {
  args: { _case: 404, message: 'The page you requested could not be found.' },
};

export const ServerErrorPage: Story = {
  args: { _case: 500, message: 'An unexpected error occurred. Please try again later.' },
};

export const SuccessPage: Story = {
  args: { _case: 200 },
};
