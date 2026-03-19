import type { Meta, StoryObj } from "storybook-php";
import { FileSize } from "./FileSize.php@badge";

const meta: Meta<typeof FileSize> = {
  component: FileSize,
  title: "Components/FileSize/Badge",
  argTypes: {
    bytes: { control: { type: "number" } },
    variant: { control: "select", options: ["default", "success", "warning", "danger"] },
  },
};

export default meta;
type Story = StoryObj<typeof FileSize>;

export const SmallFile: Story = {
  args: { bytes: 1024, variant: "default" },
};

export const MediumFile: Story = {
  args: { bytes: 5242880, variant: "success" },
};

export const LargeFile: Story = {
  args: { bytes: 2147483648, variant: "warning" },
};

export const Oversized: Story = {
  args: { bytes: 10737418240, variant: "danger" },
};
