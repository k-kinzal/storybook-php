import type { Meta, StoryObj } from "storybook-php";
import { Compass } from "./EnumCompass.php@rose";

const meta: Meta<typeof Compass> = {
  component: Compass,
  title: "Enums/CompassRose",
  argTypes: {
    highlight: { control: "select", options: ["N", "E", "S", "W"] },
  },
};

export default meta;
type Story = StoryObj<typeof Compass>;

export const Default: Story = {
  args: { highlight: "N" },
};

export const EastHighlight: Story = {
  args: { highlight: "E" },
};
