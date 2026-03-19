import type { Meta, StoryObj } from "storybook-php";
import { Greeting } from "./Greeting.php@render";

const meta: Meta<typeof Greeting> = {
  component: Greeting,
  title: "Components/Greeting",
  argTypes: {
    name: { control: "text", description: "Who to greet" },
    greeting: { control: "text", description: "The greeting word" },
  },
};

export default meta;
type Story = StoryObj<typeof Greeting>;

export const Default: Story = {
  args: { name: "World" },
};

export const CustomGreeting: Story = {
  args: { name: "Storybook", greeting: "Welcome" },
};

export const Japanese: Story = {
  args: { name: "太郎", greeting: "こんにちは" },
};
