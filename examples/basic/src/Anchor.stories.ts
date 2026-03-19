import type { Meta, StoryObj } from "storybook-php";
import { Anchor } from "./Anchor.php@render";

const meta: Meta<typeof Anchor> = {
  component: Anchor,
  title: "Components/Anchor",
  argTypes: {
    text: { control: "text" },
    href: { control: "text" },
    target: { control: "select", options: ["_self", "_blank", "_parent", "_top"] },
    underline: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Anchor>;

export const Default: Story = {
  args: { text: "Click here", href: "https://example.com" },
};

export const NoHref: Story = {
  args: { text: "Placeholder link" },
};

export const ExternalLink: Story = {
  args: { text: "Open in new tab", href: "https://example.com", target: "_blank" },
};

export const NoUnderline: Story = {
  args: { text: "Clean link", href: "https://example.com", underline: false },
};
