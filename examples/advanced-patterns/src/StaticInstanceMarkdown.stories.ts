import type { Meta, StoryObj } from "storybook-php";
import { StaticInstance } from "./StaticInstance.php@fromMarkdown";

const meta: Meta<typeof StaticInstance> = {
  component: StaticInstance,
  title: "Components/StaticInstanceMarkdown",
  argTypes: {
    text: { control: "text" },
    bold: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof StaticInstance>;

export const Plain: Story = {
  args: { text: "Static factory method rendered content" },
};

export const Bold: Story = {
  args: { text: "Bold text from static factory", bold: true },
};
