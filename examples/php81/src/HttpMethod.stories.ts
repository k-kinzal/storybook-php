import type { Meta, StoryObj } from "storybook-php";
import { HttpMethod } from "./HttpMethod.php@badge";

const meta: Meta<typeof HttpMethod> = {
  component: HttpMethod,
  title: "Enums/HttpMethod",
  argTypes: {
    _case: { control: "select", options: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
  },
};

export default meta;
type Story = StoryObj<typeof HttpMethod>;

export const Get: Story = {
  args: { _case: "GET" },
};

export const Post: Story = {
  args: { _case: "POST" },
};

export const Delete: Story = {
  args: { _case: "DELETE" },
};
