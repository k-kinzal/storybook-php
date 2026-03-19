import type { Meta, StoryObj } from "storybook-php";
import { renderAlert } from "./renderHtml.php@renderAlert";

const meta: Meta<typeof renderAlert> = {
  component: renderAlert,
  title: "Functions/RenderAlert",
  argTypes: {
    message: { control: "text" },
    type: { control: "select", options: ["info", "success", "warning", "error"] },
  },
};

export default meta;
type Story = StoryObj<typeof renderAlert>;

export const Info: Story = {
  args: { message: "Your changes have been saved." },
};

export const Success: Story = {
  args: { message: "Account created successfully!", type: "success" },
};

export const Warning: Story = {
  args: { message: "Your session will expire in 5 minutes.", type: "warning" },
};

export const Error: Story = {
  args: { message: "Failed to connect to the server.", type: "error" },
};
