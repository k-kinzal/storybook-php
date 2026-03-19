import type { Meta, StoryObj } from "storybook-php";
import { LatteFilter } from "./LatteFilter.php@render";

const meta: Meta<typeof LatteFilter> = {
  component: LatteFilter,
  title: "Nette/LatteFilter",
};

export default meta;
type Story = StoryObj<typeof LatteFilter>;

export const Default: Story = {
  args: {
    name: "John Doe",
    bio: "A <strong>passionate</strong> developer.",
    website: "https://example.com",
    role: "admin",
  },
};

export const Moderator: Story = {
  args: {
    name: "Jane Smith",
    bio: "Community <em>leader</em> and mentor.",
    website: "https://janesmith.dev",
    role: "moderator",
  },
};
