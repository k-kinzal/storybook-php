import type { Meta, StoryObj } from "storybook-php";
import { wrapEach } from "./joinItems.php@wrapEach";

const meta: Meta<typeof wrapEach> = {
  component: wrapEach,
  title: "Functions/WrapEach",
  argTypes: {
    tag: { control: "select", options: ["span", "div", "li", "p", "em", "strong"] },
    className: { control: "text" },
    items: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof wrapEach>;

export const Default: Story = {
  args: { tag: "span", items: ["First", "Second", "Third"] },
};

export const ListItems: Story = {
  args: { tag: "li", className: "list-item", items: ["Task A", "Task B", "Task C"] },
};

export const Paragraphs: Story = {
  args: { tag: "p", items: ["Introduction", "Body", "Conclusion"] },
};
