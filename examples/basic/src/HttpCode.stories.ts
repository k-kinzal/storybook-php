import type { Meta, StoryObj } from 'storybook-php';
import { HttpCode } from './HttpCode.php@badge';

const meta: Meta<typeof HttpCode> = {
  component: HttpCode,
  title: 'Enums/HttpCode',
  argTypes: {
    _case: { control: 'select', options: [200, 201, 400, 404, 500] },
  },
};

export default meta;
type Story = StoryObj<typeof HttpCode>;

export const Ok: Story = {
  args: { _case: 200 },
};

export const Created: Story = {
  args: { _case: 201 },
};

export const NotFound: Story = {
  args: { _case: 404 },
};

export const ServerError: Story = {
  args: { _case: 500 },
};
