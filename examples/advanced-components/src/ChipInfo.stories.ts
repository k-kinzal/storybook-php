import type { Meta, StoryObj } from "storybook-php";
import { InfoChip } from "./Chip.php@render";

const meta: Meta<typeof InfoChip> = {
  component: InfoChip,
  title: "Components/Chip/Info",
  argTypes: {
    label: { control: "text" },
    removable: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof InfoChip>;

export const Default: Story = {
  args: { label: "Information" },
};

export const Removable: Story = {
  args: { label: "Removable Info", removable: true },
};
