import type { Meta, StoryObj } from "storybook-php";
import { ExpandableList } from "./ExpandableList.php@expand";

const meta: Meta<typeof ExpandableList> = {
  component: ExpandableList,
  title: "Patterns/MultiInterface/Expand",
  argTypes: {
    title: { control: "text" },
    items: { control: "object" },
    emptyMessage: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof ExpandableList>;

export const WithItems: Story = {
  args: { title: "Tasks", items: ["Design mockups", "Write tests", "Deploy app", "Review PR"] },
};

export const Empty: Story = {
  args: { title: "Inbox", items: [], emptyMessage: "All caught up!" },
};
