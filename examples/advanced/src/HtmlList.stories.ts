import type { Meta, StoryObj } from "storybook-php";
import { HtmlList } from "./HtmlList.php@render";

const meta: Meta<typeof HtmlList> = {
  component: HtmlList,
  title: "Components/HtmlList",
  argTypes: {
    ordered: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof HtmlList>;

export const Unordered: Story = {
  args: {
    items: ["Apples", "Bananas", "Cherries"],
  },
};

export const Ordered: Story = {
  args: {
    items: ["First step", "Second step", "Third step"],
    ordered: true,
  },
};

export const SingleItem: Story = {
  args: {
    items: ["Only item"],
  },
};
