import type { Meta, StoryObj } from "storybook-php";
import { SelfReturn } from "./SelfReturn.php@render";

const meta: Meta<typeof SelfReturn> = {
  component: SelfReturn,
  title: "Patterns/SelfReturn",
  argTypes: {
    items: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof SelfReturn>;

export const Default: Story = {
  args: { items: ["First", "Second", "Third"] },
};

export const Empty: Story = {
  args: {},
};
