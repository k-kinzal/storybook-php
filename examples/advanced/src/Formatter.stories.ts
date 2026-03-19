import type { Meta, StoryObj } from "storybook-php";
import { Formatter } from "./Formatter.php@formatCurrency";

const meta: Meta<typeof Formatter> = {
  component: Formatter,
  title: "Components/Formatter",
  argTypes: {
    locale: { control: "text" },
    amount: { control: { type: "number", step: 0.01 } },
    symbol: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Formatter>;

export const Dollar: Story = {
  args: { locale: "en_US", amount: 42.5, symbol: "$" },
};

export const Euro: Story = {
  args: { locale: "de_DE", amount: 1234.56, symbol: "€" },
};
