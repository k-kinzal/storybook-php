import type { Meta, StoryObj } from "storybook-php";
import { CssColor } from "./CssColor.php@swatch";

const meta: Meta<typeof CssColor> = {
  component: CssColor,
  title: "Enums/CssColorSwatch",
  argTypes: {
    _case: {
      control: "select",
      options: ["#64748b", "#f43f5e", "#f59e0b", "#10b981", "#0ea5e9", "#8b5cf6"],
    },
    size: { control: { type: "range", min: 24, max: 96 } },
  },
};

export default meta;
type Story = StoryObj<typeof CssColor>;

export const Small: Story = {
  args: { _case: "#0ea5e9", size: 32 },
};

export const Large: Story = {
  args: { _case: "#f43f5e", size: 64 },
};
