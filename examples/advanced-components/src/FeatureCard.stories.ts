import type { Meta, StoryObj } from "storybook-php";
import { FeatureCard } from "./FeatureCard.php@render";

const meta: Meta<typeof FeatureCard> = {
  component: FeatureCard,
  title: "Components/FeatureCard",
  argTypes: {
    title: { control: "text" },
    body: { control: "text" },
    icon: { control: "text" },
    accentColor: { control: "color" },
  },
};

export default meta;
type Story = StoryObj<typeof FeatureCard>;

export const Default: Story = {
  args: { title: "Fast Rendering", body: "Components render in milliseconds.", icon: "⚡" },
};

export const CustomAccent: Story = {
  args: {
    title: "Secure",
    body: "Built with security in mind.",
    icon: "🔒",
    accentColor: "#10b981",
  },
};

export const TitleOnly: Story = {
  args: { title: "Simple Feature", icon: "📦" },
};
