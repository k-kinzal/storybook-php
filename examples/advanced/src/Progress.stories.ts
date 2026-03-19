import type { Meta, StoryObj } from "storybook-php";
import { Progress } from "./Progress.php@render";

const meta: Meta<typeof Progress> = {
  component: Progress,
  title: "Components/Progress",
  argTypes: {
    value: { control: { type: "number", min: 0, max: 100 } },
    max: { control: { type: "number", min: 1 } },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: { value: 65 },
};

export const Full: Story = {
  args: { value: 100, label: "Complete" },
};

export const WithStringValue: Story = {
  args: { value: "42", max: 100 },
};

export const CustomMax: Story = {
  args: { value: 3, max: 10, label: "3 of 10" },
};
