import type { Meta, StoryObj } from "storybook-php";
import { renderTagList } from "./FunctionArrayDefault.php@renderTagList";

const meta: Meta<typeof renderTagList> = {
  component: renderTagList,
  title: "Functions/FunctionArrayDefault/Tags",
  argTypes: {
    color: { control: "color" },
  },
};

export default meta;
type Story = StoryObj<typeof renderTagList>;

export const Default: Story = {
  args: {},
};

export const CustomTags: Story = {
  args: { tags: ["react", "vue", "svelte"], color: "#ec4899" },
};
