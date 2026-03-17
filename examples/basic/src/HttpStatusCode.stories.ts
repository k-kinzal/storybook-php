import type { Meta, StoryObj } from 'storybook-php';
import { HttpStatusCode } from './HttpStatusCode.php@badge';

const meta: Meta<typeof HttpStatusCode> = {
  component: HttpStatusCode,
  title: 'Enums/HttpStatusCode/Badge',
  argTypes: {
    _case: {
      control: 'select',
      options: ['OK', 'Created', 'MovedPermanently', 'NotFound', 'Forbidden', 'InternalServerError', 'BadGateway', 'ServiceUnavailable'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof HttpStatusCode>;

export const Success: Story = {
  args: { _case: 'OK' },
};

export const NotFound: Story = {
  args: { _case: 'NotFound' },
};

export const ServerError: Story = {
  args: { _case: 'InternalServerError' },
};
