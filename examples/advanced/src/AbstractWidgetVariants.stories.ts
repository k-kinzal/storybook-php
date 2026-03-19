import type { Meta, StoryObj } from "storybook-php";
import { BaseWidget } from "./AbstractWidget.php@availableVariants";

const meta: Meta<typeof BaseWidget> = {
  component: BaseWidget,
  title: "Patterns/AbstractWidgetVariants",
};

export default meta;
type Story = StoryObj<typeof BaseWidget>;

export const AvailableVariants: Story = {
  args: {},
};
