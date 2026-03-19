import type { Meta, StoryObj } from "storybook-php";
import { HttpMethod } from "./HttpMethod.php@endpoint";

const meta: Meta<typeof HttpMethod> = {
  component: HttpMethod,
  title: "Enums/HttpMethodEndpoint",
  argTypes: {
    _case: { control: "select", options: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
    path: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof HttpMethod>;

export const ListUsers: Story = {
  args: { _case: "GET", path: "/api/users", description: "List all users" },
};

export const CreateUser: Story = {
  args: { _case: "POST", path: "/api/users", description: "Create a new user" },
};

export const DeleteUser: Story = {
  args: { _case: "DELETE", path: "/api/users/{id}", description: "Delete a user" },
};
