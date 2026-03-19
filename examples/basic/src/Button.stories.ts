import type { Meta, StoryObj } from "storybook-php";
import { Button } from "./Button.php@render";

const meta: Meta<typeof Button> = {
  component: Button,
  title: "Components/Button",
  argTypes: {
    label: { control: "text" },
    variant: { control: "select", options: ["default", "primary", "secondary", "outline"] },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { label: "Click me" },
};

export const Primary: Story = {
  args: { label: "Primary", variant: "primary" },
};

export const Secondary: Story = {
  args: { label: "Secondary", variant: "secondary" },
};

export const Outline: Story = {
  args: { label: "Outline", variant: "outline" },
};

export const Disabled: Story = {
  args: { label: "Disabled", variant: "primary", disabled: true },
};
