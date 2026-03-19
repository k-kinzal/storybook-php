import type { Meta, StoryObj } from "storybook-php";
import { EnumMethodParams } from "./EnumMethodParams.php@showcase";

const meta: Meta<typeof EnumMethodParams> = {
  component: EnumMethodParams,
  title: "Enums/EnumMethodParams/Showcase",
  argTypes: {
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof EnumMethodParams>;

export const Default: Story = {
  args: { label: "Example" },
};

export const Status: Story = {
  args: { label: "Active" },
};
