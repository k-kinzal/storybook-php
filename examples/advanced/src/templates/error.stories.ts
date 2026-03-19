import type { Meta, StoryObj } from "storybook-php";
import ErrorTemplate from "./error.php";

const meta: Meta = {
  component: ErrorTemplate,
  title: "Templates/Error",
  argTypes: {
    code: { control: "select", options: [400, 401, 403, 404, 500, 503] },
    showHome: { control: "boolean" },
    message: { control: "text" },
  },
};

export default meta;
type Story = StoryObj;

export const NotFound: Story = {
  args: { code: 404, showHome: true },
};

export const Forbidden: Story = {
  args: { code: 403, showHome: true },
};

export const ServerError: Story = {
  args: { code: 500, showHome: true },
};

export const CustomMessage: Story = {
  args: { code: 404, message: "The article you requested has been removed.", showHome: true },
};

export const NoHomeLink: Story = {
  args: { code: 503, showHome: false },
};
