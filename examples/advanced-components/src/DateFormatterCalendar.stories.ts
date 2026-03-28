import type { Meta, StoryObj } from "storybook-php";
import { DateFormatter } from "./DateFormatter.php@calendar";

const meta: Meta<typeof DateFormatter> = {
  component: DateFormatter,
  title: "Components/DateFormatterCalendar",
  argTypes: {
    date: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof DateFormatter>;

export const March: Story = {
  args: { date: "2025-03-15" },
};

export const December: Story = {
  args: { date: "2025-12-25" },
};
