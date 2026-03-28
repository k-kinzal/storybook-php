import type { Meta, StoryObj } from "storybook-php";
import { Palette } from "./TraitStaticEnum.php@showcase";

const meta: Meta<typeof Palette> = {
  component: Palette,
  title: "Enums/TraitStaticEnumShowcase",
};

export default meta;
type Story = StoryObj<typeof Palette>;

export const AllSwatches: Story = {
  args: {},
};
