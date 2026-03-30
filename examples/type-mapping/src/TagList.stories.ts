/**
 * typeMap.files[*].args demo: Array element type
 *
 * The $tags param is typed as `array` in PHP, so the parser can't
 * determine the element type. typeMap.files[*].args provides `elementType: "string"`
 * so the system knows each element is a string.
 *
 * Config in main.ts:
 *   "../src/TagList.php": { args: { tags: { elementType: "string" } } }
 */
import type { Meta, StoryObj } from "storybook-php";
import { TagList } from "./TagList.php@render";

const meta: Meta<typeof TagList> = {
  component: TagList,
  title: "Args/TagList ElementType",
};

export default meta;
type Story = StoryObj<typeof TagList>;

export const Default: Story = {
  args: {
    tags: ["PHP", "Storybook", "TypeMap"],
    color: "#3b82f6",
  },
};

export const Warm: Story = {
  args: {
    tags: ["Design", "UI", "Components", "Tokens"],
    color: "#ef4444",
  },
};
