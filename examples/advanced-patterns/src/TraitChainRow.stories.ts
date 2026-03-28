import type { Meta, StoryObj } from "storybook-php";
import { TraitChain } from "./TraitChain.php@row";

const meta: Meta<typeof TraitChain> = {
  component: TraitChain,
  title: "Patterns/TraitChainRow",
  argTypes: {
    left: { control: "text" },
    right: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof TraitChain>;

export const Default: Story = {
  args: { left: "Label", right: "Value" },
};
