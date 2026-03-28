import type { Meta, StoryObj } from "storybook-php";
import FormTemplate from "./form.php";

const meta: Meta = {
  component: FormTemplate,
  title: "Templates/Form",
  argTypes: {
    action: { control: "text" },
    method: { control: "select", options: ["GET", "POST"] },
    submitLabel: { control: "text" },
  },
};

export default meta;
type Story = StoryObj;

export const ContactForm: Story = {
  args: {
    action: "/contact",
    method: "POST",
    submitLabel: "Send Message",
    fields: [
      { label: "Name", name: "name", type: "text", placeholder: "Your name" },
      { label: "Email", name: "email", type: "email", placeholder: "you@example.com" },
      { label: "Message", name: "message", type: "textarea", placeholder: "Your message..." },
    ],
  },
};

export const LoginForm: Story = {
  args: {
    action: "/login",
    method: "POST",
    submitLabel: "Sign In",
    fields: [
      { label: "Email", name: "email", type: "email", placeholder: "you@example.com" },
      { label: "Password", name: "password", type: "password", placeholder: "••••••••" },
    ],
  },
};

export const SearchForm: Story = {
  args: {
    action: "/search",
    method: "GET",
    submitLabel: "Search",
    fields: [{ label: "Query", name: "q", type: "text", placeholder: "Search..." }],
  },
};
