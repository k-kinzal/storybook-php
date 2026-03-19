import type { Meta, StoryObj } from "storybook-php";
import { badge } from "./badge.php@badge";

const meta: Meta<typeof badge> = {
  component: badge,
  title: "Components/Badge",
  argTypes: {
    color: {
      control: "color",
      description: "Badge background color",
    },
  },
};

export default meta;
type Story = StoryObj<typeof badge>;

export const Default: Story = {
  args: { label: "New" },
};

export const Green: Story = {
  args: { label: "Active", color: "green" },
};

export const Red: Story = {
  args: { label: "Deprecated", color: "red" },
};
