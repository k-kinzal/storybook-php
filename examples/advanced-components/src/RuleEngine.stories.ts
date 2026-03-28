import type { Meta, StoryObj } from "storybook-php";
import { RuleEngine } from "./RuleEngine.php@__invoke";

const meta: Meta<typeof RuleEngine> = {
  component: RuleEngine,
  title: "Patterns/Invocable/RuleEngine",
  argTypes: {
    name: { control: "text" },
    variant: { control: "select", options: ["info", "success", "danger"] },
    rule: { control: "text" },
    value: { control: "text" },
    passed: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof RuleEngine>;

export const Passing: Story = {
  args: {
    name: "Email Validator",
    variant: "info",
    rule: "format",
    value: "user@example.com",
    passed: true,
  },
};

export const Failing: Story = {
  args: {
    name: "Password Validator",
    variant: "danger",
    rule: "min-length",
    value: "***",
    passed: false,
  },
};
