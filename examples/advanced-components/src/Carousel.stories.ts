import type { Meta, StoryObj } from "storybook-php";
import { Carousel } from "./Carousel.php@render";

const meta: Meta<typeof Carousel> = {
  component: Carousel,
  title: "Components/Carousel",
  argTypes: {
    activeIndex: { control: { type: "number", min: 0 } },
    autoplay: { control: "boolean" },
    items: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof Carousel>;

export const Default: Story = {
  args: { items: ["First Slide", "Second Slide", "Third Slide"] },
};

export const SecondActive: Story = {
  args: { items: ["Alpha", "Beta", "Gamma"], activeIndex: 1 },
};

export const Autoplay: Story = {
  args: { items: ["Slide A", "Slide B"], autoplay: true },
};

export const Empty: Story = {
  args: { items: [] },
};
