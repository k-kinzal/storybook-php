import type { Meta, StoryObj } from "storybook-php";
import { highlight } from "./TextFormatter.php@highlight";

const meta: Meta<typeof highlight> = {
  component: highlight,
  title: "Functions/Highlight",
  argTypes: {
    text: { control: "text" },
    term: { control: "text" },
    color: { control: "color" },
  },
};

export default meta;
type Story = StoryObj<typeof highlight>;

export const Default: Story = {
  args: { text: "The quick brown fox jumps over the lazy dog", term: "fox" },
};

export const CustomColor: Story = {
  args: { text: "Hello World of PHP", term: "PHP", color: "#bbf7d0" },
};

export const NoMatch: Story = {
  args: { text: "Some text here", term: "" },
};
