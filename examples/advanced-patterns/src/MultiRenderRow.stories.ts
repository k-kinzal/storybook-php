import type { Meta, StoryObj } from "storybook-php";
import { MultiRender } from "./MultiRender.php@renderRow";

const meta: Meta<typeof MultiRender> = {
  component: MultiRender,
  title: "Components/MultiRenderRow",
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    icon: { control: "text" },
    striped: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof MultiRender>;

export const Row: Story = {
  args: { title: "Users", description: "1,234 active users", icon: "👥" },
};

export const Striped: Story = {
  args: { title: "Revenue", description: "$52,000 this month", icon: "💰", striped: true },
};
