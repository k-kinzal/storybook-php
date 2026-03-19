import type { Meta, StoryObj } from "storybook-php";
import { TraitChain } from "./TraitChain.php@render";

const meta: Meta<typeof TraitChain> = {
  component: TraitChain,
  title: "Patterns/TraitChain",
  argTypes: {
    title: { control: "text" },
    key: { control: "text" },
    value: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof TraitChain>;

export const Default: Story = {
  args: { title: "Details", key: "Status", value: "Active" },
};

export const Custom: Story = {
  args: { title: "Server Info", key: "Uptime", value: "99.9%" },
};
