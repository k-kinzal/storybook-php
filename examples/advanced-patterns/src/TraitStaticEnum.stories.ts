import type { Meta, StoryObj } from "storybook-php";
import { Palette } from "./TraitStaticEnum.php@swatch";

const meta: Meta<typeof Palette> = {
  component: Palette,
  title: "Enums/TraitStaticEnum",
  argTypes: {
    _case: { control: "select", options: ["#f43f5e", "#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6"] },
  },
};

export default meta;
type Story = StoryObj<typeof Palette>;

export const Rose: Story = {
  args: { _case: "#f43f5e" },
};

export const Sky: Story = {
  args: { _case: "#0ea5e9" },
};

export const Emerald: Story = {
  args: { _case: "#10b981" },
};
