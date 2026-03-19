import type { Meta, StoryObj } from "storybook-php";
import { PromotedReadonlyUnion } from "./PromotedReadonlyUnion.php@render";

const meta: Meta<typeof PromotedReadonlyUnion> = {
  component: PromotedReadonlyUnion,
  title: "Components/PromotedReadonlyUnion",
  argTypes: {
    id: { control: "text" },
    label: { control: "text" },
    amount: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof PromotedReadonlyUnion>;

export const WithStringId: Story = {
  args: { id: "SKU-001", label: "Widget", amount: 29.99 },
};

export const WithIntId: Story = {
  args: { id: 42, label: "Gadget", amount: 199 },
};

export const ZeroAmount: Story = {
  args: { id: "FREE", label: "Sample" },
};
