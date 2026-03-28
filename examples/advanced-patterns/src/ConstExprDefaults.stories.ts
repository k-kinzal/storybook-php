import type { Meta, StoryObj } from "storybook-php";
import { ConstExprDefaults } from "./ConstExprDefaults.php@render";

const meta: Meta<typeof ConstExprDefaults> = {
  component: ConstExprDefaults,
  title: "Components/ConstExprDefaults",
  argTypes: {
    debug: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ConstExprDefaults>;

export const Default: Story = {
  args: { title: "Constant Expression Defaults" },
};

export const WithCustomSeparator: Story = {
  args: { title: "Custom Separator", separator: ", " },
};

export const DebugMode: Story = {
  args: { title: "Debug Config", debug: true, maxItems: 100 },
};
