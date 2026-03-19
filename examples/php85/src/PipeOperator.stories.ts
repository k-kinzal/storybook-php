import type { Meta, StoryObj } from "storybook-php";
import { PipeOperator } from "./PipeOperator.php@render";

const meta: Meta<typeof PipeOperator> = {
  component: PipeOperator,
  title: "PHP85/PipeOperator",
};

export default meta;
type Story = StoryObj<typeof PipeOperator>;

export const Default: Story = {
  args: { text: "hello world", wrapper: "h2" },
};

export const Paragraph: Story = {
  args: { text: "  pipe operator example  ", wrapper: "p" },
};
