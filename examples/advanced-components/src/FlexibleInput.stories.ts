import type { Meta, StoryObj } from "storybook-php";
import { FlexibleInput } from "./FlexibleInput.php@render";

const meta: Meta<typeof FlexibleInput> = {
  component: FlexibleInput,
  title: "Components/FlexibleInput",
  argTypes: {
    name: { control: "text" },
    value: { control: "text" },
    type: { control: "select", options: ["text", "email", "password", "number", "url"] },
    maxLength: { control: "number" },
    required: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof FlexibleInput>;

export const Default: Story = {
  args: { name: "Username" },
};

export const WithValue: Story = {
  args: { name: "Email", value: "user@example.com", type: "email" },
};

export const NumericValue: Story = {
  args: { name: "Age", value: 25, type: "number" },
};

export const Required: Story = {
  args: { name: "Full Name", required: true, maxLength: 100 },
};

export const WithMaxLength: Story = {
  args: { name: "Bio", value: "Hello world", maxLength: 280 },
};
