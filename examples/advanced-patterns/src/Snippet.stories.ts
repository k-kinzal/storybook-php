import type { Meta, StoryObj } from "storybook-php";
import { Snippet } from "./Snippet.php@render";

const meta: Meta<typeof Snippet> = {
  component: Snippet,
  title: "Components/Snippet",
  argTypes: {
    code: { control: "text" },
    language: { control: "select", options: ["php", "javascript", "html", "css", "sql"] },
    lineNumbers: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Snippet>;

export const PHP: Story = {
  args: {
    code: '<?php\n\nfunction greet(string $name): string {\n    return "Hello, {$name}!";\n}',
    language: "php",
  },
};

export const WithLineNumbers: Story = {
  args: {
    code: "const add = (a, b) => a + b;\nconst result = add(1, 2);\nconsole.log(result);",
    language: "javascript",
    lineNumbers: true,
  },
};

export const SQL: Story = {
  args: {
    code: "SELECT u.name, COUNT(o.id) AS orders\nFROM users u\nJOIN orders o ON o.user_id = u.id\nGROUP BY u.name;",
    language: "sql",
    lineNumbers: true,
  },
};
