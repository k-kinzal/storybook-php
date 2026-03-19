import type { Meta, StoryObj } from "storybook-php";
import { EchoEnum } from "./EchoEnum.php@alert";

const meta: Meta<typeof EchoEnum> = {
  component: EchoEnum,
  title: "Enums/EchoEnum",
  argTypes: {
    _case: { control: "select", options: ["success", "error", "warning", "info"] },
    message: { control: "text" },
    dismissible: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof EchoEnum>;

export const Success: Story = {
  args: { _case: "success", message: "Operation completed successfully." },
};

export const Error: Story = {
  args: { _case: "error", message: "Something went wrong.", dismissible: true },
};

export const Warning: Story = {
  args: { _case: "warning", message: "Please review your input." },
};
