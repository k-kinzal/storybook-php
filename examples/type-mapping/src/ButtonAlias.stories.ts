/**
 * typeMap.files demo: phpFile redirect.
 *
 * button.bridge is not executable PHP. typeMap.files redirects it to
 * Button.php@render so the import still gets the full typed signature.
 */
import type { Meta, StoryObj } from "storybook-php";
import ButtonAlias from "./button.bridge";

const meta: Meta<typeof ButtonAlias> = {
  component: ButtonAlias,
  title: "Files/Button Alias Redirect",
};

export default meta;
type Story = StoryObj<typeof ButtonAlias>;

export const Primary: Story = {
  args: {
    label: "Redirected button",
    variant: "primary",
  },
};

export const Outline: Story = {
  args: {
    label: "Alias source",
    variant: "outline",
    disabled: true,
  },
};
