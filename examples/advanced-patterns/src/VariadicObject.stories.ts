import type { Meta, StoryObj } from "storybook-php";
import { VariadicObject } from "./VariadicObject.php@render";

const meta: Meta<typeof VariadicObject> = {
  component: VariadicObject,
  title: "Patterns/VariadicObject",
  argTypes: {
    items: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof VariadicObject>;

export const Default: Story = {
  args: {
    items: [
      { label: "Home", url: "/" },
      { label: "About", url: "/about" },
    ],
  },
};

export const Single: Story = {
  args: {
    items: [{ label: "Solo", url: "/solo" }],
  },
};
