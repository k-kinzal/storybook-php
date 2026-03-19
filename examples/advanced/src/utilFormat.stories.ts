import type { Meta, StoryObj } from "storybook-php";
import { formatCurrency } from "./utilFormat.php@formatCurrency";

const meta: Meta<typeof formatCurrency> = {
  component: formatCurrency,
  title: "Functions/FormatCurrency",
  argTypes: {
    amount: { control: { type: "number", step: 0.01 } },
    currency: { control: "select", options: ["USD", "EUR", "GBP", "JPY"] },
    decimals: { control: { type: "number", min: 0, max: 4 } },
  },
};

export default meta;
type Story = StoryObj<typeof formatCurrency>;

export const Default: Story = {
  args: { amount: 99.99 },
};

export const Euro: Story = {
  args: { amount: 1234.56, currency: "EUR" },
};

export const Yen: Story = {
  args: { amount: 5000, currency: "JPY", decimals: 0 },
};
