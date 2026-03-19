import type { Meta, StoryObj } from "storybook-php";
import { MarkupHelper } from "./MarkupHelper.php@image";

const meta: Meta<typeof MarkupHelper> = {
  component: MarkupHelper,
  title: "Utilities/MarkupHelper/Image",
  argTypes: {
    alt: { control: "text" },
    width: { control: { type: "range", min: 50, max: 400, step: 10 } },
    height: { control: { type: "range", min: 50, max: 300, step: 10 } },
    bgColor: { control: "color" },
  },
};

export default meta;
type Story = StoryObj<typeof MarkupHelper>;

export const Default: Story = {
  args: { alt: "Placeholder", width: 200, height: 150 },
};

export const Wide: Story = {
  args: { alt: "Banner", width: 400, height: 100, bgColor: "#dbeafe" },
};

export const Square: Story = {
  args: { alt: "Avatar", width: 120, height: 120, bgColor: "#fce7f3" },
};
