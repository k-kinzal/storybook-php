import type { Meta, StoryObj } from "storybook-php";
import { DateRange } from "./DateRange.php@render";

const meta: Meta<typeof DateRange> = {
  component: DateRange,
  title: "Components/DateRange",
  argTypes: {
    start: { control: "text" },
    end: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof DateRange>;

export const Default: Story = {
  args: { start: "2025-01-01", end: "2025-12-31" },
};

export const ShortRange: Story = {
  args: { start: "2025-06-01", end: "2025-06-07" },
};
