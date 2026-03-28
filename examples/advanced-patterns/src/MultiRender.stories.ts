import type { Meta, StoryObj } from "storybook-php";
import { MultiRender } from "./MultiRender.php@render";

const meta: Meta<typeof MultiRender> = {
  component: MultiRender,
  title: "Components/MultiRender",
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    icon: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof MultiRender>;

export const Default: Story = {
  args: { title: "Feature", description: "A great feature", icon: "🚀" },
};

export const NoIcon: Story = {
  args: { title: "Plain Item", description: "Without an icon" },
};
