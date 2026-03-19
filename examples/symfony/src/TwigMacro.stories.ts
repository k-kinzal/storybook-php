import type { Meta, StoryObj } from "storybook-php";
import { TwigMacro } from "./TwigMacro.php@render";

const meta: Meta<typeof TwigMacro> = {
  component: TwigMacro,
  title: "Symfony/TwigMacro",
};

export default meta;
type Story = StoryObj<typeof TwigMacro>;

export const Default: Story = {
  args: { username: "johndoe", role: "Admin", joinedAt: "2024-01-15" },
};

export const Moderator: Story = {
  args: { username: "janedoe", role: "Moderator", joinedAt: "2025-06-01" },
};
