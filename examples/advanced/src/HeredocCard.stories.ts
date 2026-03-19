import type { Meta, StoryObj } from "storybook-php";
import { HeredocCard } from "./HeredocCard.php@render";

const meta: Meta<typeof HeredocCard> = {
  component: HeredocCard,
  title: "Components/HeredocCard",
  argTypes: {
    title: { control: "text" },
    body: { control: "text" },
    theme: { control: "select", options: ["light", "dark"] },
    imageUrl: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof HeredocCard>;

export const Light: Story = {
  args: {
    title: "Heredoc Syntax",
    body: "This card uses PHP heredoc strings for template rendering.",
  },
};

export const Dark: Story = {
  args: { title: "Dark Theme", body: "Heredoc with dark theme support.", theme: "dark" },
};

export const WithImage: Story = {
  args: {
    title: "Featured Post",
    body: "A card with an image header.",
    imageUrl: "https://picsum.photos/400/200",
  },
};
