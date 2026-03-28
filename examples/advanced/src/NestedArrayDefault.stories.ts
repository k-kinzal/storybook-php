import type { Meta, StoryObj } from "storybook-php";
import renderNestedDefault from "./NestedArrayDefault.php@renderNestedDefault";

const meta: Meta<typeof renderNestedDefault> = {
  component: renderNestedDefault,
  title: "Patterns/NestedArrayDefault",
  argTypes: {
    title: { control: "text" },
    config: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof renderNestedDefault>;

export const Default: Story = {
  args: {},
};

export const Custom: Story = {
  args: {
    title: "Custom Grid",
    config: { border: false, colors: { header: "#000", cell: "#999" } },
  },
};
