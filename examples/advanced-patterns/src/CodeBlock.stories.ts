import type { Meta, StoryObj } from "storybook-php";
import { CodeBlock } from "./CodeBlock.php@render";

const meta: Meta<typeof CodeBlock> = {
  component: CodeBlock,
  title: "Patterns/CodeBlock",
  argTypes: {
    code: { control: "text" },
    language: { control: "select", options: ["php", "javascript", "html", "css"] },
    lineNumbers: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const PhpSnippet: Story = {
  args: {
    code: '<?php\n$greeting = "Hello";\necho $greeting . " World!";',
    language: "php",
    lineNumbers: false,
  },
};

export const WithLineNumbers: Story = {
  args: {
    code: 'function greet(string $name): string {\n    return "Hello, {$name}!";\n}',
    language: "php",
    lineNumbers: true,
  },
};

export const JavaScript: Story = {
  args: {
    code: "const sum = (a, b) => a + b;\nconsole.log(sum(1, 2));",
    language: "javascript",
    lineNumbers: true,
  },
};
