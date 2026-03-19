import type { Meta, StoryObj } from "storybook-php";
import { Settings } from "./Settings.php@render";

const meta: Meta<typeof Settings> = {
  component: Settings,
  title: "Components/Settings",
  argTypes: {
    theme: { control: "select", options: ["light", "dark"] },
    fontSize: { control: { type: "range", min: 10, max: 24, step: 1 } },
    animations: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Settings>;

export const Light: Story = {
  args: { theme: "light", fontSize: 14, animations: true },
};

export const Dark: Story = {
  args: { theme: "dark", fontSize: 16, animations: true },
};

export const LargeFont: Story = {
  args: { theme: "light", fontSize: 20, animations: false },
};
