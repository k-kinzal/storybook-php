import type { Meta, StoryObj } from "storybook-php";
import { echoGreet } from "./echoGreet.php@echoGreet";

const meta: Meta<typeof echoGreet> = {
  component: echoGreet,
  title: "Functions/EchoGreet",
  argTypes: {
    name: { control: "text" },
    style: { control: "select", options: ["banner", "inline", "toast"] },
  },
};

export default meta;
type Story = StoryObj<typeof echoGreet>;

export const Banner: Story = {
  args: { name: "World", style: "banner" },
};

export const Inline: Story = {
  args: { name: "Developer", style: "inline" },
};

export const Toast: Story = {
  args: { name: "User", style: "toast" },
};
