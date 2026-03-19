import type { Meta, StoryObj } from "storybook-php";
import { DualCallable } from "./DualCallable.php@render";

const meta: Meta<typeof DualCallable> = {
  component: DualCallable,
  title: "Patterns/DualCallable/Render",
  argTypes: {
    label: { control: "text" },
    variant: { control: "select", options: ["default", "primary", "danger"] },
  },
};

export default meta;
type Story = StoryObj<typeof DualCallable>;

export const Default: Story = {
  args: { label: "Dual Callable Card" },
};

export const Primary: Story = {
  args: { label: "Primary Card", variant: "primary" },
};
