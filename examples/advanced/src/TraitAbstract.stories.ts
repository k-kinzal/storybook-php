import type { Meta, StoryObj } from "storybook-php";
import { TraitAbstract } from "./TraitAbstract.php@render";

const meta: Meta<typeof TraitAbstract> = {
  component: TraitAbstract,
  title: "Patterns/TraitAbstract",
  argTypes: {
    title: { control: "text" },
    body: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof TraitAbstract>;

export const Default: Story = {
  args: { title: "Template Method Pattern" },
};

export const WithBody: Story = {
  args: {
    title: "Article Title",
    body: "The trait defines the layout, the class provides the content.",
  },
};
