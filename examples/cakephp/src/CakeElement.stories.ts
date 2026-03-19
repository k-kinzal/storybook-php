import type { Meta, StoryObj } from "storybook-php";
import { CakeElement } from "./CakeElement.php@render";

const meta: Meta<typeof CakeElement> = {
  component: CakeElement,
  title: "CakePHP/CakeElement",
};

export default meta;
type Story = StoryObj<typeof CakeElement>;

export const Default: Story = {
  args: { name: "Feature", status: "active" },
};

export const Inactive: Story = {
  args: { name: "Legacy Module", status: "inactive" },
};
