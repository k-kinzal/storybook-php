import type { Meta, StoryObj } from "storybook-php";
import { TwigLayout } from "./TwigLayout.php@render";

const meta: Meta<typeof TwigLayout> = {
  component: TwigLayout,
  title: "Symfony/TwigLayout",
};

export default meta;
type Story = StoryObj<typeof TwigLayout>;

export const Default: Story = {
  args: { title: "My Page", content: "Welcome to the page." },
};

export const CustomContent: Story = {
  args: { title: "About Us", content: "Learn more about our team and mission." },
};
