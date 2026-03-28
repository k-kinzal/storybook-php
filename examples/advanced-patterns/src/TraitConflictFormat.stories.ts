import type { Meta, StoryObj } from "storybook-php";
import { TraitConflict } from "./TraitConflict.php@format";

const meta: Meta<typeof TraitConflict> = {
  component: TraitConflict,
  title: "Traits/TraitConflict/HtmlFormat",
  argTypes: {
    text: { control: "text" },
    tag: { control: "select", options: ["div", "section", "article", "p"] },
  },
};

export default meta;
type Story = StoryObj<typeof TraitConflict>;

export const Default: Story = {
  args: { text: "Hello from HTML format trait", tag: "div" },
};

export const Section: Story = {
  args: { text: "Section content with HTML formatting", tag: "section" },
};
