import type { Meta, StoryObj } from "storybook-php";
import { CIPartial } from "./CIPartial.php@render";

const meta: Meta<typeof CIPartial> = {
  component: CIPartial,
  title: "CodeIgniter/CIPartial",
};

export default meta;
type Story = StoryObj<typeof CIPartial>;

export const Default: Story = {
  args: { name: "Feature", status: "active" },
};

export const Inactive: Story = {
  args: { name: "Legacy Module", status: "inactive" },
};
