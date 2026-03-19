import type { Meta, StoryObj } from "storybook-php";
import { TypedConstant } from "./TypedConstant.php@render";

const meta: Meta<typeof TypedConstant> = {
  component: TypedConstant,
  title: "PHP83/TypedConstant",
};

export default meta;
type Story = StoryObj<typeof TypedConstant>;

export const Default: Story = {
  args: {},
};

export const Custom: Story = {
  args: { text: "Long text that might be truncated", maxLength: 10 },
};
