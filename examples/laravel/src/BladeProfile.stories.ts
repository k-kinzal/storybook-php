import type { Meta, StoryObj } from "storybook-php";
import { BladeProfile } from "./BladeProfile.php@render";

const meta: Meta<typeof BladeProfile> = {
  component: BladeProfile,
  title: "Laravel/BladeProfile",
};

export default meta;
type Story = StoryObj<typeof BladeProfile>;

export const Default: Story = {
  args: { name: "John Doe", role: "Developer" },
};

export const Admin: Story = {
  args: { name: "Jane Smith", role: "Admin", avatar: "https://via.placeholder.com/64/ff6b6b" },
};
