import type { Meta, StoryObj } from "storybook-php";
import { ValueCard } from "./ValueCard.php@render";

const meta: Meta<typeof ValueCard> = {
  component: ValueCard,
  title: "Components/ValueCard",
  argTypes: {
    label: { control: "text" },
    value: { control: "text" },
    unit: { control: "text" },
    trend: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof ValueCard>;

export const Default: Story = {
  args: { label: "Temperature", value: "23.5", unit: "°C" },
};

export const WithUpTrend: Story = {
  args: { label: "Revenue", value: "$12,345", trend: "+12%" },
};

export const WithDownTrend: Story = {
  args: { label: "Errors", value: "42", trend: "-8%" },
};

export const Simple: Story = {
  args: { label: "Active Users", value: "1,234" },
};
