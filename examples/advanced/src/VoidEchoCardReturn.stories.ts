import type { Meta, StoryObj } from "storybook-php";
import { VoidEchoCard } from "./VoidEchoCard.php@render";

const meta: Meta<typeof VoidEchoCard> = {
  component: VoidEchoCard,
  title: "Components/VoidEchoCard/Return",
  argTypes: {
    title: { control: "text" },
    body: { control: "text" },
    variant: { control: "select", options: ["default", "primary", "success"] },
  },
};

export default meta;
type Story = StoryObj<typeof VoidEchoCard>;

export const Default: Story = {
  args: { title: "Return Card", body: "Rendered via string return.", variant: "default" },
};
