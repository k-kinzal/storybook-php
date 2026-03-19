import type { Meta, StoryObj } from "storybook-php";
import { Money } from "./Money.php@fromDollars";

const meta: Meta<typeof Money> = {
  component: Money,
  title: "Components/MoneyFromDollars",
  argTypes: {
    dollars: { control: "number" },
    currency: { control: "select", options: ["USD", "EUR", "GBP", "JPY"] },
  },
};

export default meta;
type Story = StoryObj<typeof Money>;

export const Default: Story = {
  args: { dollars: 19.99 },
};

export const Pounds: Story = {
  args: { dollars: 125.0, currency: "GBP" },
};
