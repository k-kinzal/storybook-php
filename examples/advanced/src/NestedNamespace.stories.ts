import type { Meta, StoryObj } from "storybook-php";
import { TextInput } from "./NestedNamespace.php@render";

const meta: Meta<typeof TextInput> = {
  component: TextInput,
  title: "Forms/TextInput",
  argTypes: {
    name: { control: "text" },
    label: { control: "text" },
    type: { control: "select", options: ["text", "email", "password", "url", "tel"] },
    placeholder: { control: "text" },
    required: { control: "boolean" },
    helpText: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
  args: { name: "username", placeholder: "Enter your username" },
};

export const WithLabel: Story = {
  args: { name: "email", label: "Email Address", type: "email", placeholder: "you@example.com" },
};

export const Required: Story = {
  args: {
    name: "password",
    label: "Password",
    type: "password",
    required: true,
    helpText: "Must be at least 8 characters",
  },
};

export const WithHelp: Story = {
  args: {
    name: "website",
    label: "Website",
    type: "url",
    placeholder: "https://",
    helpText: "Enter the full URL including https://",
  },
};
