import type { Meta, StoryObj } from "storybook-php";
import { DnfParam } from "./DnfParam.php@render";

const meta: Meta<typeof DnfParam> = {
  component: DnfParam,
  title: "Patterns/DnfParam",
  argTypes: {
    title: { control: "text" },
    badge: { control: "text" },
    compact: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof DnfParam>;

export const Default: Story = {
  args: { title: "DNF Types" },
};

export const WithBadge: Story = {
  args: { title: "Feature", badge: "new" },
};

export const Compact: Story = {
  args: { title: "Compact View", badge: "beta", compact: true },
};
