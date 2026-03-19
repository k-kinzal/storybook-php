import type { Meta, StoryObj } from "storybook-php";
import FeaturesTemplate from "../templates/features.php";

const meta: Meta = {
  component: FeaturesTemplate,
  title: "Templates/Features",
  argTypes: {
    heading: { control: "text" },
    columns: { control: { type: "range", min: 1, max: 4 } },
  },
};

export default meta;
type Story = StoryObj;

export const ThreeColumn: Story = {
  args: {
    heading: "Why Choose Us",
    columns: 3,
    features: [
      { icon: "🚀", title: "Fast", description: "Lightning-fast performance out of the box." },
      { icon: "🔒", title: "Secure", description: "Enterprise-grade security by default." },
      { icon: "🎨", title: "Beautiful", description: "Elegant UI components you will love." },
    ],
  },
};

export const TwoColumn: Story = {
  args: {
    heading: "Key Benefits",
    columns: 2,
    features: [
      { icon: "⚡", title: "Performance", description: "Optimized for speed and efficiency." },
      { icon: "🔧", title: "Flexible", description: "Easily customizable to fit your needs." },
    ],
  },
};

export const FourColumn: Story = {
  args: {
    heading: "Platform Features",
    columns: 4,
    features: [
      { icon: "📊", title: "Analytics", description: "Track everything." },
      { icon: "🤝", title: "Collaboration", description: "Work together." },
      { icon: "🔄", title: "Sync", description: "Real-time sync." },
      { icon: "📱", title: "Mobile", description: "Works everywhere." },
    ],
  },
};
