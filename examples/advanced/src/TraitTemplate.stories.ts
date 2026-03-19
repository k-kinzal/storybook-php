import type { Meta, StoryObj } from "storybook-php";
import { InfoSection } from "./TraitTemplate.php@render";

const meta: Meta<typeof InfoSection> = {
  component: InfoSection,
  title: "Patterns/TraitTemplate",
  argTypes: {
    title: { control: "text" },
    content: { control: "text" },
    note: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof InfoSection>;

export const Default: Story = {
  args: { title: "Getting Started", content: "Follow the steps below to configure your project." },
};

export const WithNote: Story = {
  args: {
    title: "Important",
    content: "Please read the documentation carefully.",
    note: "Last updated: March 2026",
  },
};
