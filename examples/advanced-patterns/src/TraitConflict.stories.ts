import type { Meta, StoryObj } from "storybook-php";
import { TraitConflict } from "./TraitConflict.php@render";

const meta: Meta<typeof TraitConflict> = {
  component: TraitConflict,
  title: "Traits/TraitConflict",
  argTypes: {
    title: { control: "text" },
    content: { control: "text" },
    mode: { control: "select", options: ["html", "plain"] },
  },
};

export default meta;
type Story = StoryObj<typeof TraitConflict>;

export const HtmlMode: Story = {
  args: {
    title: "Formatted Output",
    content: "This content is rendered with HTML formatting.",
    mode: "html",
  },
};

export const PlainMode: Story = {
  args: {
    title: "Plain Output",
    content: 'function hello() {\n  return "world";\n}',
    mode: "plain",
  },
};
