import type { Meta, StoryObj } from "storybook-php";
import { TwigPartial } from "./TwigPartial.php@render";

const meta: Meta<typeof TwigPartial> = {
  component: TwigPartial,
  title: "Symfony/TwigPartial",
};

export default meta;
type Story = StoryObj<typeof TwigPartial>;

export const Default: Story = {
  args: { name: "Feature", status: "active" },
};

export const Inactive: Story = {
  args: { name: "Legacy Module", status: "inactive" },
};
