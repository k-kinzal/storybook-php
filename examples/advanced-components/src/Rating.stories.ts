import type { Meta, StoryObj } from "storybook-php";
import { Rating } from "./Rating.php@render";

const meta: Meta<typeof Rating> = {
  component: Rating,
  title: "Components/Rating",
  argTypes: {
    value: { control: { type: "number", min: 0, max: 10 } },
    max: { control: { type: "number", min: 1, max: 10 } },
  },
};

export default meta;
type Story = StoryObj<typeof Rating>;

export const ThreeOfFive: Story = {
  args: { value: 3 },
};

export const FiveOfFive: Story = {
  args: { value: 5 },
};

export const ZeroOfFive: Story = {
  args: { value: 0 },
};

export const SevenOfTen: Story = {
  args: { value: 7, max: 10 },
};
