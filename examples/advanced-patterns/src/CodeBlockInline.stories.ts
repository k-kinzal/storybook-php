import type { Meta, StoryObj } from "storybook-php";
import { CodeBlock } from "./CodeBlock.php@inline";

const meta: Meta<typeof CodeBlock> = {
  component: CodeBlock,
  title: "Patterns/CodeBlockInline",
  argTypes: {
    code: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const Default: Story = {
  args: { code: "$variable" },
};

export const FunctionCall: Story = {
  args: { code: "array_map()" },
};
