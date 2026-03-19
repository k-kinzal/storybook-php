import type { Meta, StoryObj } from "storybook-php";
import { Layout } from "./Layout.php@render";

const meta: Meta<typeof Layout> = {
  component: Layout,
  title: "Components/Layout",
  argTypes: {
    theme: { control: "select", options: ["light", "dark"] },
  },
};

export default meta;
type Story = StoryObj<typeof Layout>;

export const Light: Story = {
  args: { title: "My Application" },
};

export const Dark: Story = {
  args: { title: "Dark Theme", theme: "dark" },
};
