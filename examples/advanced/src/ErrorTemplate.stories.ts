import type { Meta, StoryObj } from 'storybook-php';
import ErrorTemplate from './templates/error.php';

const meta: Meta = {
  component: ErrorTemplate,
  title: 'Templates/Error',
  argTypes: {
    code: { control: 'number' },
    message: { control: 'text' },
    showHome: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const NotFound: Story = {
  args: { code: 404 },
};

export const ServerError: Story = {
  args: { code: 500 },
};

export const Forbidden: Story = {
  args: { code: 403 },
};

export const Unauthorized: Story = {
  args: { code: 401 },
};

export const Maintenance: Story = {
  args: { code: 503 },
};

export const CustomMessage: Story = {
  args: {
    code: 404,
    message: 'The article you were looking for has been removed.',
  },
};

export const NoHomeLink: Story = {
  args: { code: 500, showHome: false },
};
