import type { Meta, StoryObj } from "storybook-php";
import { CILayout } from "./CILayout.php@render";

const meta: Meta<typeof CILayout> = {
  component: CILayout,
  title: "CodeIgniter/CILayout",
};

export default meta;
type Story = StoryObj<typeof CILayout>;

export const Default: Story = {
  args: { title: "My Page", content: "Welcome to the page." },
};

export const CustomContent: Story = {
  args: { title: "About Us", content: "Learn more about our team and mission." },
};
