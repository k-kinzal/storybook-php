import type { Meta, StoryObj } from "storybook-php";
import { Widget } from "./Widget.php@badge";

const meta: Meta<typeof Widget> = {
  component: Widget,
  title: "Components/Widget/Badge",
  argTypes: {
    text: { control: "text", description: "Badge text" },
    color: { control: "color", description: "Badge background color" },
  },
};

export default meta;
type Story = StoryObj<typeof Widget>;

export const Default: Story = {
  args: { title: "Widget", text: "NEW" },
};

export const Custom: Story = {
  args: { title: "Widget", text: "SALE", color: "#ef4444" },
};
