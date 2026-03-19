import type { Meta, StoryObj } from "storybook-php";
import { alignedBox } from "./EnumDefaultFunc.php@alignedBox";

const meta: Meta<typeof alignedBox> = {
  component: alignedBox,
  title: "Functions/AlignedBox",
  argTypes: {
    content: { control: "text" },
    align: { control: "select", options: ["left", "center", "right"] },
    bg: { control: "color" },
  },
};

export default meta;
type Story = StoryObj<typeof alignedBox>;

export const Left: Story = {
  args: { content: "Left aligned text" },
};

export const Center: Story = {
  args: { content: "Centered text", align: "center" },
};

export const Right: Story = {
  args: { content: "Right aligned text", align: "right", bg: "#dbeafe" },
};
