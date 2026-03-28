import type { Meta, StoryObj } from "storybook-php";
import { ArrayOfObjects } from "./ArrayOfObjects.php@render";

const meta: Meta<typeof ArrayOfObjects> = {
  component: ArrayOfObjects,
  title: "Patterns/ArrayOfObjects",
  argTypes: {
    items: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof ArrayOfObjects>;

export const Default: Story = {
  args: {
    items: [
      { label: "Item 1", value: 10 },
      { label: "Item 2", value: 20 },
    ],
  },
};

export const Empty: Story = {
  args: { items: [] },
};
