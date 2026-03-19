import type { Meta, StoryObj } from "storybook-php";
import { formatBytes } from "./scalarFunc.php@formatBytes";

const meta: Meta<typeof formatBytes> = {
  component: formatBytes,
  title: "Functions/FormatBytes",
  argTypes: {
    bytes: { control: { type: "number", min: 0 } },
    precision: { control: { type: "number", min: 0, max: 6 } },
  },
};

export default meta;
type Story = StoryObj<typeof formatBytes>;

export const Kilobytes: Story = {
  args: { bytes: 2048, precision: 1 },
};

export const Megabytes: Story = {
  args: { bytes: 5242880, precision: 2 },
};

export const Gigabytes: Story = {
  args: { bytes: 1073741824, precision: 2 },
};

export const SmallFile: Story = {
  args: { bytes: 512, precision: 0 },
};
