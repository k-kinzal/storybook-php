import type { Meta, StoryObj } from "storybook-php";
import { MethodConstantDefault } from "./MethodConstantDefault.php@render";

const meta: Meta<typeof MethodConstantDefault> = {
  component: MethodConstantDefault,
  title: "Components/MethodConstantDefault",
  argTypes: {
    content: { control: "text" },
    title: { control: "text" },
    format: { control: "select", options: ["html", "text"] },
    maxLength: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof MethodConstantDefault>;

export const Default: Story = {
  args: {
    content: "This is a sample paragraph demonstrating method constant defaults.",
    title: "Example",
  },
};

export const TextFormat: Story = {
  args: {
    content: "Plain text output without HTML formatting.",
    title: "Text Mode",
    format: "text",
  },
};

export const Truncated: Story = {
  args: {
    content:
      "A very long text that should be truncated at a specific length to demonstrate the maxLength parameter with constant defaults.",
    title: "Long Content",
    maxLength: 40,
  },
};
