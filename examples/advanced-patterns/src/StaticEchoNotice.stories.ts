import type { Meta, StoryObj } from "storybook-php";
import { StaticEcho } from "./StaticEcho.php@notice";

const meta: Meta<typeof StaticEcho> = {
  component: StaticEcho,
  title: "Patterns/StaticEchoNotice",
  argTypes: {
    message: { control: "text" },
    type: { control: "select", options: ["info", "success", "warning"] },
  },
};

export default meta;
type Story = StoryObj<typeof StaticEcho>;

export const Info: Story = {
  args: { message: "This is an informational notice.", type: "info" },
};

export const Success: Story = {
  args: { message: "Operation completed successfully.", type: "success" },
};

export const Warning: Story = {
  args: { message: "Please review before continuing.", type: "warning" },
};
