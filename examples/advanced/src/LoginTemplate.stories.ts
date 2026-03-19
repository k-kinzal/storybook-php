import type { Meta, StoryObj } from "storybook-php";
import LoginTemplate from "./templates/login.php";

const meta: Meta = {
  component: LoginTemplate,
  title: "Templates/Login",
  argTypes: {
    title: { control: "text" },
    showRemember: { control: "boolean" },
    showForgot: { control: "boolean" },
    error: { control: "text" },
    buttonText: { control: "text" },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { title: "Sign In" },
};

export const WithError: Story = {
  args: {
    title: "Sign In",
    error: "Invalid email or password. Please try again.",
  },
};

export const Minimal: Story = {
  args: {
    title: "Login",
    showRemember: false,
    showForgot: false,
    buttonText: "Log In",
  },
};

export const CustomButton: Story = {
  args: {
    title: "Welcome Back",
    buttonText: "Continue",
  },
};
