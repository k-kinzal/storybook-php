import type { Meta, StoryObj } from "storybook-php";
import DirectTemplate from "./views/direct-template.blade.php";

const meta: Meta<typeof DirectTemplate> = {
  component: DirectTemplate,
  title: "Laravel/Blade Direct Import",
};

export default meta;
type Story = StoryObj<typeof DirectTemplate>;

export const Default: Story = {
  args: {
    title: "Direct Blade import",
  },
};

export const Custom: Story = {
  args: {
    title: "Template from Blade",
    message: "This story imports the Blade file itself instead of a PHP component class.",
  },
};
