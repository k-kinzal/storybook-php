import type { Meta, StoryObj } from "storybook-php";
import { pill } from "./helpers.php@pill";

const meta: Meta<typeof pill> = {
  component: pill,
  title: "Functions/Pill",
  argTypes: {
    text: { control: "text" },
    outline: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof pill>;

export const Default: Story = {
  args: { text: "Tag" },
};

export const Outline: Story = {
  args: { text: "Outline Tag", outline: true },
};
