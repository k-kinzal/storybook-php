import type { Meta, StoryObj } from "storybook-php";
import { Currency } from "./Currency.php@format";

const meta: Meta<typeof Currency> = {
  component: Currency,
  title: "Enums/CurrencyFormat",
  argTypes: {
    _case: { control: "select", options: ["USD", "EUR", "GBP", "JPY"] },
    amount: { control: "number" },
    decimals: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof Currency>;

export const Default: Story = {
  args: { _case: "USD", amount: 1234.56 },
};

export const Euro: Story = {
  args: { _case: "EUR", amount: 99.99 },
};

export const Yen: Story = {
  args: { _case: "JPY", amount: 15000, decimals: 0 },
};
