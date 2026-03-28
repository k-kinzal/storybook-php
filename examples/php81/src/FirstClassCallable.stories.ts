import type { Meta, StoryObj } from "storybook-php";
import { FirstClassCallable } from "./FirstClassCallable.php@render";

const meta: Meta<typeof FirstClassCallable> = {
  component: FirstClassCallable,
  title: "PHP81/FirstClassCallable",
  argTypes: {
    text: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof FirstClassCallable>;

export const Default: Story = {
  args: { text: "Hello World" },
};

export const Empty: Story = {
  args: { text: "" },
};
