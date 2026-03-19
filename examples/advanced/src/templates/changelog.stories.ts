import type { Meta, StoryObj } from "storybook-php";
import ChangelogTemplate from "../templates/changelog.php";

const meta: Meta = {
  component: ChangelogTemplate,
  title: "Templates/Changelog",
  argTypes: {
    version: { control: "text" },
    compact: { control: "boolean" },
    entries: { control: "object" },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    version: "2.1.0",
    entries: [
      { type: "added", description: "Dark mode support" },
      { type: "added", description: "Export to CSV" },
      { type: "fixed", description: "Navigation overflow on mobile" },
      { type: "changed", description: "Updated icon library to v5" },
      { type: "removed", description: "Legacy IE11 polyfills" },
    ],
  },
};

export const Compact: Story = {
  args: {
    version: "2.0.1",
    compact: true,
    entries: [
      { type: "fixed", description: "Login redirect loop" },
      { type: "fixed", description: "Date picker timezone issue" },
    ],
  },
};

export const Empty: Story = {
  args: { version: "3.0.0", entries: [] },
};
