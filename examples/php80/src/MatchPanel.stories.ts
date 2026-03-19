import type { Meta, StoryObj } from "storybook-php";
import { MatchPanel } from "./MatchPanel.php@render";

const meta: Meta<typeof MatchPanel> = {
  component: MatchPanel,
  title: "Patterns/MatchPanel",
  argTypes: {
    variant: { control: "select", options: ["default", "card", "banner", "minimal"] },
    title: { control: "text" },
    content: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof MatchPanel>;

export const Default: Story = {
  args: {
    variant: "default",
    title: "Panel Title",
    content: "Rendered using match expression dispatch.",
  },
};

export const Card: Story = {
  args: { variant: "card", title: "Card Layout", content: "Elevated card with shadow styling." },
};

export const Banner: Story = {
  args: {
    variant: "banner",
    title: "Announcement",
    content: "Gradient banner for important messages.",
  },
};

export const Minimal: Story = {
  args: { variant: "minimal", title: "Compact", content: "Inline minimal layout." },
};
