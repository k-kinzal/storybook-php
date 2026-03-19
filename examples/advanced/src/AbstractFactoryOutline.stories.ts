import type { Meta, StoryObj } from "storybook-php";
import { AbstractFactory } from "./AbstractFactory.php@outline";

const meta: Meta<typeof AbstractFactory> = {
  component: AbstractFactory,
  title: "Patterns/AbstractFactoryOutline",
  argTypes: {
    label: { control: "text" },
    color: { control: "color" },
  },
};

export default meta;
type Story = StoryObj<typeof AbstractFactory>;

export const Default: Story = {
  args: { label: "Draft", color: "#3b82f6" },
};

export const Warning: Story = {
  args: { label: "Pending", color: "#f59e0b" },
};
