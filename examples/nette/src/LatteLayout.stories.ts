import type { Meta, StoryObj } from "storybook-php";
import { LatteLayout } from "./LatteLayout.php@render";

const meta: Meta<typeof LatteLayout> = {
  component: LatteLayout,
  title: "Nette/LatteLayout",
};

export default meta;
type Story = StoryObj<typeof LatteLayout>;

export const Default: Story = {
  args: { title: "My Page", content: "Welcome to the page." },
};

export const CustomContent: Story = {
  args: { title: "About Us", content: "Learn more about our team and mission." },
};
