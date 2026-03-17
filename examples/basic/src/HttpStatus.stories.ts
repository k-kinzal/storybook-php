import type { Meta, StoryObj } from 'storybook-php';
import { HttpStatus } from './HttpStatus.php@badge';

const meta: Meta<typeof HttpStatus> = {
  component: HttpStatus,
  title: 'Enums/HttpStatus/Badge',
  argTypes: {
    _case: { control: 'select', options: [200, 201, 400, 404, 500] },
  },
};

export default meta;
type Story = StoryObj<typeof HttpStatus>;

export const Ok: Story = {
  args: { _case: 200 },
};

export const NotFound: Story = {
  args: { _case: 404 },
};

export const ServerError: Story = {
  args: { _case: 500 },
};
