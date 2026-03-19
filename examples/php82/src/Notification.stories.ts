import type { Meta, StoryObj } from "storybook-php";
import { Notification } from "./Notification.php@render";

const meta: Meta<typeof Notification> = {
  component: Notification,
  title: "Components/Notification",
  argTypes: {
    message: { control: "text" },
    type: { control: "select", options: ["info", "warning", "error"] },
    timeout: { control: { type: "number", min: 1000, max: 30000 } },
  },
};

export default meta;
type Story = StoryObj<typeof Notification>;

export const Info: Story = {
  args: { message: "File saved successfully" },
};

export const Warning: Story = {
  args: { message: "Low disk space remaining", type: "warning" },
};

export const Error: Story = {
  args: { message: "Connection lost", type: "error", timeout: 10000 },
};

export const WithMetadata: Story = {
  args: { message: "Disk usage at 95%", type: "error", metadata: "disk-usage-95", timeout: 15000 },
};
