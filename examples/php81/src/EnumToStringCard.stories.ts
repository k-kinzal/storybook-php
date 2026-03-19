import type { Meta, StoryObj } from "storybook-php";
import { MoodCard } from "./EnumToString.php@render";

const meta: Meta<typeof MoodCard> = {
  component: MoodCard,
  title: "Components/MoodCard",
  argTypes: {
    mood: { control: "select", options: ["happy", "sad", "neutral", "excited"] },
  },
};

export default meta;
type Story = StoryObj<typeof MoodCard>;

export const Default: Story = {
  args: { mood: "neutral", message: "How are you feeling today?" },
};

export const HappyMood: Story = {
  args: { mood: "happy", message: "Things are going great!" },
};

export const SadMood: Story = {
  args: { mood: "sad", message: "Better days are ahead." },
};
