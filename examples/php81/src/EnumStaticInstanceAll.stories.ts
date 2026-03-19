import type { Meta, StoryObj } from "storybook-php";
import { EnumStaticInstance } from "./EnumStaticInstance.php@all";

const meta: Meta<typeof EnumStaticInstance> = {
  component: EnumStaticInstance,
  title: "Enums/EnumStaticInstanceAll",
};

export default meta;
type Story = StoryObj<typeof EnumStaticInstance>;

export const AllBadges: Story = {
  args: {},
};
