import type { Meta, StoryObj } from "storybook-php";
import { MultiRender } from "./MultiRender.php@renderCard";

const meta: Meta<typeof MultiRender> = {
  component: MultiRender,
  title: "Components/MultiRenderCard",
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    icon: { control: "text" },
    footer: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof MultiRender>;

export const Card: Story = {
  args: {
    title: "Dashboard",
    description: "View your analytics and metrics.",
    icon: "📊",
    footer: "Updated 5 min ago",
  },
};

export const CardNoFooter: Story = {
  args: { title: "Settings", description: "Manage your preferences.", icon: "⚙️" },
};
