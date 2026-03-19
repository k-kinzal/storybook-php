import type { Meta, StoryObj } from "storybook-php";
import ContactTemplate from "./contact.php";

const meta: Meta<typeof ContactTemplate> = {
  component: ContactTemplate,
  title: "Templates/Contact",
  argTypes: {
    name: { control: "text" },
    email: { control: "text" },
    subject: { control: "select", options: ["General Inquiry", "Support", "Sales", "Feedback"] },
    message: { control: "text" },
    submitLabel: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof ContactTemplate>;

export const Empty: Story = {
  args: {},
};

export const Prefilled: Story = {
  args: {
    name: "Alice Johnson",
    email: "alice@example.com",
    subject: "Support",
    message: "I need help with my account.",
  },
};

export const CustomButton: Story = {
  args: { submitLabel: "Submit Feedback", subject: "Feedback" },
};
