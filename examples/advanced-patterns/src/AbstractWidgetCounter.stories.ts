import type { Meta, StoryObj } from "storybook-php";
import { CounterWidget } from "./AbstractWidget.php@display";

const meta: Meta<typeof CounterWidget> = {
  component: CounterWidget,
  title: "Patterns/AbstractWidgetCounter",
  argTypes: {
    title: { control: "text" },
    count: { control: { type: "number", min: 0, max: 200 } },
    max: { control: { type: "number", min: 1, max: 200 } },
    variant: { control: "select", options: ["default", "primary", "success", "danger"] },
  },
};

export default meta;
type Story = StoryObj<typeof CounterWidget>;

export const Default: Story = {
  args: { title: "Progress", count: 42, max: 100, variant: "default" },
};

export const Complete: Story = {
  args: { title: "Upload", count: 100, max: 100, variant: "success" },
};

export const Warning: Story = {
  args: { title: "Storage", count: 85, max: 100, variant: "danger" },
};
