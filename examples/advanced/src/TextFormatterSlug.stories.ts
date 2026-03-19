import type { Meta, StoryObj } from "storybook-php";
import { slugify } from "./TextFormatter.php@slugify";

const meta: Meta<typeof slugify> = {
  component: slugify,
  title: "Functions/Slugify",
  argTypes: {
    text: { control: "text" },
    separator: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof slugify>;

export const Default: Story = {
  args: { text: "Hello World Example" },
};

export const WithUnderscores: Story = {
  args: { text: "My Blog Post Title!", separator: "_" },
};

export const SpecialCharacters: Story = {
  args: { text: "Café & Résumé (2024)" },
};
