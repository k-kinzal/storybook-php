import type { Meta, StoryObj } from "storybook-php";
import { FluentElement } from "./FluentElement.php@render";

const meta: Meta<typeof FluentElement> = {
  component: FluentElement,
  title: "Patterns/FluentElement",
  argTypes: {
    tag: { control: "text", description: "HTML tag" },
    content: { control: "text", description: "Element content" },
  },
};

export default meta;
type Story = StoryObj<typeof FluentElement>;

export const Div: Story = {
  args: { tag: "div", content: "Fluent builder with static return type" },
};

export const Section: Story = {
  args: { tag: "section", content: "Section element" },
};

export const Span: Story = {
  args: { tag: "span", content: "Inline element" },
};
