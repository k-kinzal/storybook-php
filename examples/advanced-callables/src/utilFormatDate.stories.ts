import type { Meta, StoryObj } from "storybook-php";
import { formatDate } from "./utilFormat.php@formatDate";

const meta: Meta<typeof formatDate> = {
  component: formatDate,
  title: "Functions/FormatDate",
  argTypes: {
    date: { control: "text" },
    format: { control: "select", options: ["long", "short", "iso", "time"] },
  },
};

export default meta;
type Story = StoryObj<typeof formatDate>;

export const Long: Story = {
  args: { date: "2024-12-25" },
};

export const Short: Story = {
  args: { date: "2024-12-25", format: "short" },
};

export const ISO: Story = {
  args: { date: "2024-06-15", format: "iso" },
};
