import type { Meta, StoryObj } from "storybook-php";
import { Widget } from "./Widget.php@actionBar";

const meta: Meta<typeof Widget> = {
  component: Widget,
  title: "Components/Widget/Actions",
  argTypes: {
    primaryLabel: { control: "text", description: "Primary button label" },
    secondaryLabel: { control: "text", description: "Secondary button label" },
  },
};

export default meta;
type Story = StoryObj<typeof Widget>;

export const PrimaryOnly: Story = {
  args: { title: "Widget", primaryLabel: "Save" },
};

export const WithSecondary: Story = {
  args: { title: "Widget", primaryLabel: "Submit", secondaryLabel: "Cancel" },
};
