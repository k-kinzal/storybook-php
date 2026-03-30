/**
 * typeMap.files[*].args demo: String option set
 *
 * The $variant param is a plain `string` in PHP. Without typeMap,
 * Storybook renders a text input. With typeMap.files[*].args providing `options`,
 * the control becomes a select dropdown automatically.
 *
 * Config in main.ts:
 *   "../src/Button.php": { args: { variant: { options: [...] } } }
 */
import type { Meta, StoryObj } from "storybook-php";
import { Button } from "./Button.php@render";

const meta: Meta<typeof Button> = {
  component: Button,
  title: "Args/Button Options",
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { label: "Click me", variant: "default" },
};

export const Primary: Story = {
  args: { label: "Submit", variant: "primary" },
};

export const Danger: Story = {
  args: { label: "Delete", variant: "danger", disabled: true },
};
