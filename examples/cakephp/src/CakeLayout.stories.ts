import type { Meta, StoryObj } from "storybook-php";
import { CakeLayout } from "./CakeLayout.php@render";

const meta: Meta<typeof CakeLayout> = {
  component: CakeLayout,
  title: "CakePHP/CakeLayout",
};

export default meta;
type Story = StoryObj<typeof CakeLayout>;

export const Default: Story = {
  args: { title: "My Page", content: "Welcome to the page." },
};

export const CustomContent: Story = {
  args: { title: "About Us", content: "Learn more about our team and mission." },
};
