import type { Meta, StoryObj } from "storybook-php";
import { PropertyHook } from "./PropertyHook.php@render";

const meta: Meta<typeof PropertyHook> = {
  component: PropertyHook,
  title: "PHP84/PropertyHook",
};

export default meta;
type Story = StoryObj<typeof PropertyHook>;

export const Default: Story = {
  args: { displayName: "Alice", age: 30 },
};

export const TrimmedName: Story = {
  args: { displayName: "  Bob  ", age: 25 },
};
