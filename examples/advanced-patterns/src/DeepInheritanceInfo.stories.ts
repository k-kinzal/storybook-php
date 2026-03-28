import type { Meta, StoryObj } from "storybook-php";
import { InfoWidget } from "./DeepInheritance.php@render";

const meta: Meta<typeof InfoWidget> = {
  component: InfoWidget,
  title: "Patterns/DeepInheritanceInfo",
  argTypes: {
    title: { control: "text" },
    theme: { control: "select", options: ["light", "dark", "accent"] },
    message: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof InfoWidget>;

export const Default: Story = {
  args: { title: "Info Widget", message: "This is a mid-level widget." },
};
