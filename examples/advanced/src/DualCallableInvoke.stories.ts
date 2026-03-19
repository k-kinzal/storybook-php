import type { Meta, StoryObj } from "storybook-php";
import { DualCallable } from "./DualCallable.php@__invoke";

const meta: Meta<typeof DualCallable> = {
  component: DualCallable,
  title: "Patterns/DualCallable/Invoke",
  argTypes: {
    label: { control: "text" },
    variant: { control: "select", options: ["default", "primary", "danger"] },
    wrapper: { control: "select", options: ["span", "div", "strong"] },
  },
};

export default meta;
type Story = StoryObj<typeof DualCallable>;

export const Default: Story = {
  args: { label: "Invoked Badge" },
};

export const PrimaryDiv: Story = {
  args: { label: "Primary Badge", variant: "primary", wrapper: "div" },
};
