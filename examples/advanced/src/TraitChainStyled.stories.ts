import type { Meta, StoryObj } from "storybook-php";
import { TraitChain } from "./TraitChain.php@styled";

const meta: Meta<typeof TraitChain> = {
  component: TraitChain,
  title: "Patterns/TraitChainStyled",
  argTypes: {
    text: { control: "text" },
    color: { control: "color" },
    size: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof TraitChain>;

export const Default: Story = {
  args: { text: "Styled text from nested trait" },
};

export const Colored: Story = {
  args: { text: "Blue large text", color: "#3b82f6", size: "20px" },
};
