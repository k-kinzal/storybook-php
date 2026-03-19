import type { Meta, StoryObj } from "storybook-php";
import { MenuAction } from "./MenuAction.php@palette";

const meta: Meta<typeof MenuAction> = {
  component: MenuAction,
  title: "Enums/MenuAction/Palette",
};

export default meta;
type Story = StoryObj<typeof MenuAction>;

export const AllActions: Story = {};
