import type { Meta, StoryObj } from "storybook-php";
import { NullableAlert } from "./NullableAlert.php@render";

const meta: Meta<typeof NullableAlert> = {
  component: NullableAlert,
  title: "Components/NullableAlert",
  argTypes: {
    message: { control: "text" },
    title: { control: "text" },
    icon: { control: "text" },
    action: { control: "text" },
    type: { control: "select", options: ["info", "warning", "error", "success"] },
  },
};

export default meta;
type Story = StoryObj<typeof NullableAlert>;

export const Simple: Story = {
  args: { message: "This is a simple alert with only a message." },
};

export const WithTitle: Story = {
  args: {
    message: "Please check your input and try again.",
    title: "Validation Error",
    type: "error",
  },
};

export const WithIcon: Story = {
  args: { message: "Your changes have been saved.", icon: "✓", type: "success" },
};

export const FullFeatured: Story = {
  args: {
    message: "A new version is available.",
    title: "Update Available",
    icon: "🔄",
    action: "Update Now",
    type: "info",
  },
};
