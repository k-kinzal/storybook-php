import type { Meta, StoryObj } from "storybook-php";
import { MarkupHelper } from "./MarkupHelper.php@button";

const meta: Meta<typeof MarkupHelper> = {
  component: MarkupHelper,
  title: "Utilities/MarkupHelper/Button",
  argTypes: {
    label: { control: "text" },
    variant: { control: "select", options: ["primary", "secondary", "outline", "danger"] },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof MarkupHelper>;

export const Primary: Story = {
  args: { label: "Click Me", variant: "primary" },
};

export const Outline: Story = {
  args: { label: "Outline", variant: "outline" },
};

export const Danger: Story = {
  args: { label: "Delete", variant: "danger" },
};

export const Disabled: Story = {
  args: { label: "Disabled", variant: "primary", disabled: true },
};
