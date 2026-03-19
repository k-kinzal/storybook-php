import type { Meta, StoryObj } from "storybook-php";
import { renderNav } from "./FunctionArrayDefault.php@renderNav";

const meta: Meta<typeof renderNav> = {
  component: renderNav,
  title: "Functions/FunctionArrayDefault",
  argTypes: {
    separator: { control: "text" },
    activeClass: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof renderNav>;

export const Default: Story = {
  args: {},
};

export const CustomItems: Story = {
  args: { items: ["Dashboard", "Settings", "Profile", "Logout"], separator: " / " },
};
