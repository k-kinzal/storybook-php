import type { Meta, StoryObj } from "storybook-php";
import { ListStyle } from "./ListStyle.php@preview";

const meta: Meta<typeof ListStyle> = {
  component: ListStyle,
  title: "Enums/ListStyle/Preview",
};

export default meta;
type Story = StoryObj<typeof ListStyle>;

export const Default: Story = {
  args: {
    items: ["Apple", "Banana", "Cherry", "Date"],
  },
};

export const Tasks: Story = {
  args: {
    items: ["Design mockup", "Implement feature", "Write tests", "Deploy"],
  },
};
