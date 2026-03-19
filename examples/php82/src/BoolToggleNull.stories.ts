import type { Meta, StoryObj } from "storybook-php";
import { BoolToggle } from "./BoolToggle.php@renderNull";

const meta: Meta<typeof BoolToggle> = {
  component: BoolToggle,
  title: "Components/BoolToggle/Null",
};

export default meta;
type Story = StoryObj<typeof BoolToggle>;

export const Default: Story = {};
