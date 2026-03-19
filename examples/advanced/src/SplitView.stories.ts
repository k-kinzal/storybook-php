import type { Meta, StoryObj } from "storybook-php";
import { SplitView } from "./SplitView.php@renderFull";

const meta: Meta<typeof SplitView> = {
  component: SplitView,
  title: "Patterns/SplitView/Full",
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    imageUrl: { control: "text" },
    theme: { control: "select", options: ["light", "dark"] },
  },
};

export default meta;
type Story = StoryObj<typeof SplitView>;

export const Default: Story = {
  args: { title: "Full Card View" },
};

export const WithDescription: Story = {
  args: { title: "Project Alpha", description: "A detailed card with description text." },
};

export const Dark: Story = {
  args: { title: "Dark Theme", description: "Dark mode card", theme: "dark" },
};
