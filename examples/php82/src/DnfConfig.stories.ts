import type { Meta, StoryObj } from "storybook-php";
import { DnfConfig } from "./DnfConfig.php@render";

const meta: Meta<typeof DnfConfig> = {
  component: DnfConfig,
  title: "PHP82/DnfType",
  argTypes: {
    name: { control: "text" },
    source: { control: "text" },
    debug: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof DnfConfig>;

export const Default: Story = {
  args: { name: "app.config", source: "environment" },
};

export const Debug: Story = {
  args: { name: "dev.config", source: "local-file", debug: true },
};
