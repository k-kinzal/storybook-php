import type { Meta, StoryObj } from "storybook-php";
import { PhpDocGenericList } from "./PhpDocGenericList.php@render";

const meta: Meta<typeof PhpDocGenericList> = {
  component: PhpDocGenericList,
  title: "Patterns/PhpDocGenericList",
  argTypes: {
    items: { control: "object" },
    title: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof PhpDocGenericList>;

export const Default: Story = {
  args: { items: ["Alpha", "Beta", "Gamma"], title: "Tags" },
};

export const Empty: Story = {
  args: { items: [], title: "Empty List" },
};
