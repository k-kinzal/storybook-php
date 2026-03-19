import type { Meta, StoryObj } from "storybook-php";
import { DeprecatedAttr } from "./DeprecatedAttr.php@renderModern";

const meta: Meta<typeof DeprecatedAttr> = {
  component: DeprecatedAttr,
  title: "PHP84/DeprecatedAttr",
};

export default meta;
type Story = StoryObj<typeof DeprecatedAttr>;

export const Default: Story = {
  args: { name: "World", style: "modern" },
};

export const Custom: Story = {
  args: { name: "PHP 8.4", style: "cutting-edge" },
};
