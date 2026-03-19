import type { Meta, StoryObj } from "storybook-php";
import { MixedOutput } from "./MixedOutput.php@renderEcho";

const meta: Meta<typeof MixedOutput> = {
  component: MixedOutput,
  title: "Patterns/MixedOutput/Echo",
  argTypes: {
    title: { control: "text" },
    content: { control: "text" },
    variant: { control: "select", options: ["info", "success", "warning", "danger"] },
  },
};

export default meta;
type Story = StoryObj<typeof MixedOutput>;

export const Info: Story = {
  args: { title: "Echo Notice", content: "This uses echo statements." },
};

export const Warning: Story = {
  args: { title: "Warning", content: "Please be careful.", variant: "warning" },
};
