import type { Meta, StoryObj } from "storybook-php";
import { ObjectConfig } from "./ObjectConfig.php@render";

const meta: Meta<typeof ObjectConfig> = {
  component: ObjectConfig,
  title: "Patterns/ObjectConfig",
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof ObjectConfig>;

export const Default: Story = {
  args: {
    title: "Default Theme",
    description: "Uses the default ThemeConfig with blue primary color.",
  },
};

export const CustomTitle: Story = {
  args: {
    title: "Custom Card",
    description: "Object parameter defaults are applied automatically.",
  },
};
