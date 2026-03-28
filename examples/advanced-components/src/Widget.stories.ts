import type { Meta, StoryObj } from "storybook-php";
import { Widget } from "./Widget.php@render";

const meta: Meta<typeof Widget> = {
  component: Widget,
  title: "Components/Widget",
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Widget>;

export const Default: Story = {
  args: { title: "My Widget", description: "A versatile component with multiple traits." },
};

export const TitleOnly: Story = {
  args: { title: "Minimal Widget" },
};
