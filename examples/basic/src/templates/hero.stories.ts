import type { Meta, StoryObj } from "storybook-php";
import HeroTemplate from "../templates/hero.php";

const meta: Meta = {
  component: HeroTemplate,
  title: "Templates/Hero",
  argTypes: {
    title: { control: "text" },
    subtitle: { control: "text" },
    ctaLabel: { control: "text" },
    ctaUrl: { control: "text" },
    theme: { control: "select", options: ["light", "dark", "gradient"] },
  },
};

export default meta;
type Story = StoryObj;

export const Light: Story = {
  args: {
    title: "Build Better PHP Components",
    subtitle: "Preview and develop with Storybook.",
    ctaLabel: "Get Started",
    ctaUrl: "#start",
  },
};

export const Dark: Story = {
  args: {
    title: "Dark Theme Hero",
    subtitle: "A dramatic hero section.",
    ctaLabel: "Learn More",
    theme: "dark",
  },
};

export const Gradient: Story = {
  args: {
    title: "Beautiful Gradient",
    subtitle: "Eye-catching hero with gradient background.",
    theme: "gradient",
  },
};

export const Minimal: Story = {
  args: { title: "Simple Hero" },
};
