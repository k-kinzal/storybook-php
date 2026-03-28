import type { Meta, StoryObj } from "storybook-php";
import { ArrayBadgeList } from "./ArrayBadgeList.php@render";

const meta: Meta<typeof ArrayBadgeList> = {
  component: ArrayBadgeList,
  title: "Components/ArrayBadgeList",
  argTypes: {
    title: { control: "text" },
    color: { control: "color" },
    items: { control: "object" },
    inline: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ArrayBadgeList>;

export const Default: Story = {
  args: { items: ["PHP", "TypeScript", "Storybook"] },
};

export const Technologies: Story = {
  args: { title: "Stack", items: ["Laravel", "React", "PostgreSQL", "Redis"], color: "#8b5cf6" },
};

export const Stacked: Story = {
  args: { title: "Categories", items: ["Design", "Development", "Testing"], inline: false },
};

export const Empty: Story = {
  args: { items: [] },
};
