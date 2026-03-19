import type { Meta, StoryObj } from "storybook-php";
import { BladePartial } from "./BladePartial.php@render";

const meta: Meta<typeof BladePartial> = {
  component: BladePartial,
  title: "Laravel/BladePartial",
};

export default meta;
type Story = StoryObj<typeof BladePartial>;

export const Default: Story = {
  args: { name: "Feature", status: "active" },
};

export const Inactive: Story = {
  args: { name: "Legacy Module", status: "inactive" },
};
