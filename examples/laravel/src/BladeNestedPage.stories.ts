import type { Meta, StoryObj } from "storybook-php";
import { BladeNestedPage } from "./BladeNestedPage.php@render";

const meta: Meta<typeof BladeNestedPage> = {
  component: BladeNestedPage,
  title: "Laravel/BladeNestedPage",
  argTypes: {
    showAlert: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof BladeNestedPage>;

export const Default: Story = {
  args: {
    title: "Nested Page",
    subtitle: "Testing multi-level Blade rendering",
    items: [
      { name: "Item A", status: "active" },
      { name: "Item B", status: "inactive" },
    ],
    showAlert: true,
  },
};

export const CustomItems: Story = {
  args: {
    title: "Custom Nested Page",
    subtitle: "With custom items and alert hidden",
    items: [
      { name: "Alpha", status: "active" },
      { name: "Beta", status: "pending" },
      { name: "Gamma", status: "inactive" },
    ],
    showAlert: false,
  },
};
