import type { Meta, StoryObj } from "storybook-php";
import { generateList } from "./generatorFunc.php@generateList";

const meta: Meta<typeof generateList> = {
  component: generateList,
  title: "Functions/GeneratorList",
  argTypes: {
    title: { control: "text" },
    count: { control: { type: "range", min: 1, max: 10 } },
    marker: { control: "select", options: ["disc", "circle", "square", "none"] },
  },
};

export default meta;
type Story = StoryObj<typeof generateList>;

export const Default: Story = {
  args: { title: "Shopping List", count: 4, marker: "disc" },
};

export const Numbered: Story = {
  args: { title: "Steps", count: 5, marker: "decimal" },
};

export const NoMarkers: Story = {
  args: { title: "Plain", count: 3, marker: "none" },
};
