import type { Meta, StoryObj } from "storybook-php";
import { EnumArrayReturn } from "./EnumArrayReturn.php@card";

const meta: Meta<typeof EnumArrayReturn> = {
  component: EnumArrayReturn,
  title: "Enums/EnumArrayReturn",
  argTypes: {
    _case: { control: "select", options: ["success", "warning", "error"] },
    message: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof EnumArrayReturn>;

export const Success: Story = {
  args: { _case: "success", message: "File saved successfully." },
};

export const Warning: Story = {
  args: { _case: "warning", message: "Disk space is running low." },
};

export const Error: Story = {
  args: { _case: "error", message: "Connection timed out." },
};
