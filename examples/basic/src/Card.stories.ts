import type { Meta, StoryObj } from "storybook-php";
import { Card } from "./Card.php@render";

const meta: Meta<typeof Card> = {
  component: Card,
  title: "Components/Card",
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "secondary", "danger"],
    },
    featured: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: { title: "Card Title", body: "Card body content goes here." },
};

export const Primary: Story = {
  args: { title: "Primary Card", body: "A primary variant card.", variant: "primary" },
};

export const Featured: Story = {
  args: {
    title: "Featured Card",
    body: "This card is featured!",
    variant: "primary",
    featured: true,
  },
};
