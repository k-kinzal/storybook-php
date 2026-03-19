import type { Meta, StoryObj } from "storybook-php";
import { LattePartial } from "./LattePartial.php@render";

const meta: Meta<typeof LattePartial> = {
  component: LattePartial,
  title: "Nette/LattePartial",
};

export default meta;
type Story = StoryObj<typeof LattePartial>;

export const Default: Story = {
  args: { name: "Feature", status: "active" },
};

export const Inactive: Story = {
  args: { name: "Legacy Module", status: "inactive" },
};
