import type { Meta, StoryObj } from "storybook-php";
import FormTemplate from "./templates/form.php";

const meta: Meta<typeof FormTemplate> = {
  component: FormTemplate,
  title: "Templates/Form",
};

export default meta;
type Story = StoryObj<typeof FormTemplate>;

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
    submitLabel: "Sign In",
    fields: [
      { label: "Username", name: "username", type: "text", placeholder: "Username" },
      { label: "Password", name: "password", type: "password", placeholder: "Password" },
    ],
  },
};
