import type { Meta, StoryObj } from "storybook-php";
import { Mood } from "./EnumToString.php@render";

const meta: Meta<typeof Mood> = {
  component: Mood,
  title: "Enums/EnumToString",
  argTypes: {
    _case: { control: "select", options: ["happy", "sad", "neutral", "excited"] },
  },
};

export default meta;
type Story = StoryObj<typeof Mood>;

export const Happy: Story = {
  args: { _case: "happy" },
};

export const Sad: Story = {
  args: { _case: "sad" },
};

export const Neutral: Story = {
  args: { _case: "neutral" },
};

export const Excited: Story = {
  args: { _case: "excited" },
};
