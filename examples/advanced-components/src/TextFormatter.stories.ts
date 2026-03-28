import type { Meta, StoryObj } from "storybook-php";
import { truncate } from "./TextFormatter.php@truncate";

const meta: Meta<typeof truncate> = {
  component: truncate,
  title: "Functions/Truncate",
  argTypes: {
    text: { control: "text" },
    length: { control: { type: "number", min: 1, max: 200 } },
    suffix: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof truncate>;

export const Short: Story = {
  args: { text: "Hello World" },
};

export const Long: Story = {
  args: {
    text: "This is a very long string that should be truncated at the specified length",
    length: 30,
  },
};

export const CustomSuffix: Story = {
  args: { text: "A really long piece of text for testing", length: 20, suffix: " [...]" },
};
