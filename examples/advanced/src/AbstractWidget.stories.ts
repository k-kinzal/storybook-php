import type { Meta, StoryObj } from "storybook-php";
import { InfoWidget } from "./AbstractWidget.php@display";

const meta: Meta<typeof InfoWidget> = {
  component: InfoWidget,
  title: "Patterns/AbstractWidget",
  argTypes: {
    title: { control: "text" },
    message: { control: "text" },
    variant: { control: "select", options: ["default", "primary", "success", "danger"] },
  },
};

export default meta;
type Story = StoryObj<typeof InfoWidget>;

export const Default: Story = {
  args: { title: "Notice", message: "This is an informational message.", variant: "default" },
};

export const Primary: Story = {
  args: {
    title: "Update Available",
    message: "A new version is ready to install.",
    variant: "primary",
  },
};

export const Success: Story = {
  args: {
    title: "Saved",
    message: "Your changes have been saved successfully.",
    variant: "success",
  },
};
