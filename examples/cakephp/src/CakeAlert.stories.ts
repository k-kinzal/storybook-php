import type { Meta, StoryObj } from "storybook-php";
import { CakeAlert } from "./CakeAlert.php@render";

const meta: Meta<typeof CakeAlert> = {
  component: CakeAlert,
  title: "CakePHP/CakeAlert",
  argTypes: {
    type: { control: "select", options: ["info", "success", "warning", "danger"] },
    dismissible: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof CakeAlert>;

export const Info: Story = {
  args: { title: "Heads up!", type: "info", message: "This is an informational alert." },
};

export const Success: Story = {
  args: { title: "Well done!", type: "success", message: "Your changes have been saved." },
};

export const DangerDismissible: Story = {
  args: { title: "Error", type: "danger", message: "Something went wrong.", dismissible: true },
};

export const TitleOnly: Story = {
  args: { title: "Simple notice", type: "warning" },
};
