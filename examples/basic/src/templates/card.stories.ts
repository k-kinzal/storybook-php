import type { Meta, StoryObj } from "storybook-php";
import CardTemplate from "../templates/card.php";

const meta: Meta = {
  component: CardTemplate,
  title: "Templates/Card",
  argTypes: {
    title: { control: "text" },
    body: { control: "text" },
    variant: { control: "select", options: ["default", "primary", "secondary"] },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { title: "Template Card", body: "This is rendered from a PHP template file." },
};

export const Primary: Story = {
  args: { title: "Primary", body: "Primary variant template.", variant: "primary" },
};
