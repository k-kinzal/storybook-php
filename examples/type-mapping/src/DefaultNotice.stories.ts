/**
 * typeMap.args demo: Runtime defaults and nullable overrides.
 *
 * Neither $limit nor $subtitle has a useful runtime fallback in PHP alone.
 * typeMap.args fills those values when Storybook omits them.
 */
import type { Meta, StoryObj } from "storybook-php";
import { DefaultNotice } from "./DefaultNotice.php@render";

const meta: Meta<typeof DefaultNotice> = {
  component: DefaultNotice,
  title: "Args/DefaultNotice Defaults",
};

export default meta;
type Story = StoryObj<typeof DefaultNotice>;

export const Default: Story = {
  args: {
    title: "Runtime defaults",
  },
};

export const WithSubtitle: Story = {
  args: {
    title: "Custom subtitle",
    subtitle: "Provided explicitly from Storybook args.",
    limit: 5,
  },
};
