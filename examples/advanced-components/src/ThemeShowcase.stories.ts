import type { Meta, StoryObj } from "storybook-php";
import { ThemeShowcase } from "./ThemeShowcase.php@render";

const meta: Meta<typeof ThemeShowcase> = {
  component: ThemeShowcase,
  title: "Components/ThemeShowcase",
  argTypes: {
    theme: { control: "select", options: ["light", "dark", "system"] },
    visible: { control: "boolean" },
    opacity: { control: { type: "range", min: 0, max: 1, step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeShowcase>;

export const Light: Story = {
  args: {
    title: "Dashboard",
    subtitle: "Light theme preview",
    theme: "light",
    tags: ["ui", "theme"],
  },
};

export const Dark: Story = {
  args: { title: "Dashboard", subtitle: "Dark theme preview", theme: "dark", tags: ["ui", "dark"] },
};

export const Hidden: Story = {
  args: { title: "Hidden Card", theme: "system", visible: false, opacity: 0.4 },
};

export const AllDefaults: Story = {
  args: {},
};
