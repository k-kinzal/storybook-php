import type { Meta, StoryObj } from "storybook-php";
import { CakeCard } from "./CakeCard.php@render";

const meta: Meta<typeof CakeCard> = {
  component: CakeCard,
  title: "CakePHP/CakeCard",
  argTypes: {
    featured: { control: "boolean" },
    image: { control: "text" },
    footer: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof CakeCard>;

export const Default: Story = {
  args: { title: "Card Title", body: "Rendered via CakePHP native PHP templates." },
};

export const WithImage: Story = {
  args: {
    title: "Mountain View",
    body: "A beautiful landscape captured at sunrise.",
    image: "https://picsum.photos/seed/mountain/400/200",
    footer: "Photo credit: Unsplash",
  },
};

export const Featured: Story = {
  args: {
    title: "Featured Article",
    body: "This card uses the featured variant with highlighted border.",
    featured: true,
    footer: "Published today",
  },
};
