import type { Meta, StoryObj } from "storybook-php";
import { LogLevel } from "./LogLevel.php@badge";

const meta: Meta<typeof LogLevel> = {
  component: LogLevel,
  title: "Enums/LogLevel",
  argTypes: {
    _case: { control: "select", options: ["debug", "info", "warning", "error", "critical"] },
  },
};

export default meta;
type Story = StoryObj<typeof LogLevel>;

export const Info: Story = {
  args: { _case: "info" },
};

export const Warning: Story = {
  args: { _case: "warning" },
};

export const Error: Story = {
  args: { _case: "error" },
};

export const Critical: Story = {
  args: { _case: "critical" },
};
