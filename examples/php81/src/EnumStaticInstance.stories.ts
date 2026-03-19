import type { Meta, StoryObj } from "storybook-php";
import { EnumStaticInstance } from "./EnumStaticInstance.php@badge";

const meta: Meta<typeof EnumStaticInstance> = {
  component: EnumStaticInstance,
  title: "Enums/EnumStaticInstance",
  argTypes: {
    _case: { control: "select", options: ["info", "success", "warning", "error"] },
  },
};

export default meta;
type Story = StoryObj<typeof EnumStaticInstance>;

export const InfoBadge: Story = {
  args: { _case: "info" },
};

export const SuccessBadge: Story = {
  args: { _case: "success" },
};

export const ErrorBadge: Story = {
  args: { _case: "error" },
};
