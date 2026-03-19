import type { Meta, StoryObj } from "storybook-php";
import { VoidEchoCard } from "./VoidEchoCard.php@renderEcho";

const meta: Meta<typeof VoidEchoCard> = {
  component: VoidEchoCard,
  title: "Components/VoidEchoCard/Echo",
  argTypes: {
    title: { control: "text" },
    body: { control: "text" },
    variant: { control: "select", options: ["default", "primary", "success"] },
  },
};

export default meta;
type Story = StoryObj<typeof VoidEchoCard>;

export const Default: Story = {
  args: { title: "Echo Card", body: "Rendered via void method with echo.", variant: "default" },
};

export const Primary: Story = {
  args: { title: "Primary Card", body: "Blue variant using echo output.", variant: "primary" },
};

export const Success: Story = {
  args: { title: "Success", body: "Operation completed successfully.", variant: "success" },
};
