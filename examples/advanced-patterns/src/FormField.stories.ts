import type { Meta, StoryObj } from "storybook-php";
import { FormField } from "./FormField.php@render";

const meta: Meta<typeof FormField> = {
  component: FormField,
  title: "Components/FormField",
  argTypes: {
    label: { control: "text" },
    type: { control: "select", options: ["text", "email", "password", "number", "tel", "url"] },
    id: { control: "text" },
    required: { control: "boolean" },
    placeholder: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const Text: Story = {
  args: { label: "Full Name", placeholder: "Enter your name" },
};

export const Email: Story = {
  args: { label: "Email Address", type: "email", required: true, placeholder: "user@example.com" },
};

export const Password: Story = {
  args: { label: "Password", type: "password", required: true },
};

export const WithCustomId: Story = {
  args: {
    label: "Phone Number",
    type: "tel",
    id: "contact-phone",
    placeholder: "+1 (555) 000-0000",
  },
};
