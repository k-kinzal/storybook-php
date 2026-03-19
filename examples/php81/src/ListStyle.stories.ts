import type { Meta, StoryObj } from "storybook-php";
import { ListStyle } from "./ListStyle.php@renderList";

const meta: Meta<typeof ListStyle> = {
  component: ListStyle,
  title: "Enums/ListStyle/RenderList",
  argTypes: {
    _case: { control: "select", options: ["disc", "decimal", "square", "none"] },
    title: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof ListStyle>;

export const Bullet: Story = {
  args: {
    _case: "disc",
    items: ["First item", "Second item", "Third item"],
    title: "Bullet List",
  },
};

export const Numbered: Story = {
  args: {
    _case: "decimal",
    items: ["Step one", "Step two", "Step three"],
    title: "Ordered Steps",
  },
};

export const NoStyle: Story = {
  args: {
    _case: "none",
    items: ["Plain item A", "Plain item B"],
    title: "Plain List",
  },
};
