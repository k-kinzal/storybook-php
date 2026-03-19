import type { Meta, StoryObj } from "storybook-php";
import { formatFileSize } from "./utilFormat.php@formatFileSize";

const meta: Meta<typeof formatFileSize> = {
  component: formatFileSize,
  title: "Functions/FormatFileSize",
  argTypes: {
    bytes: { control: { type: "number", min: 0 } },
    precision: { control: { type: "number", min: 0, max: 3 } },
  },
};

export default meta;
type Story = StoryObj<typeof formatFileSize>;

export const Bytes: Story = {
  args: { bytes: 512 },
};

export const Kilobytes: Story = {
  args: { bytes: 153600 },
};

export const Megabytes: Story = {
  args: { bytes: 8388608, precision: 2 },
};

export const Gigabytes: Story = {
  args: { bytes: 2147483648 },
};
