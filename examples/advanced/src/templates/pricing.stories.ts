import type { Meta, StoryObj } from "storybook-php";
import PricingTemplate from "./pricing.php";

const meta: Meta = {
  component: PricingTemplate,
  title: "Templates/Pricing",
  argTypes: {
    currency: { control: "select", options: ["USD", "EUR", "GBP", "JPY"] },
    period: { control: "select", options: ["month", "year"] },
    highlighted: { control: "text" },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    plans: [
      { name: "Starter", price: 9, features: ["5 projects", "1 GB storage", "Email support"] },
      {
        name: "Pro",
        price: 29,
        features: ["Unlimited projects", "10 GB storage", "Priority support", "API access"],
      },
      {
        name: "Enterprise",
        price: 99,
        features: ["Unlimited everything", "SLA", "Dedicated support", "Custom integrations"],
      },
    ],
    currency: "USD",
    period: "month",
    highlighted: "Pro",
  },
};

export const Annual: Story = {
  args: {
    plans: [
      { name: "Basic", price: 79, features: ["10 projects", "5 GB storage"] },
      { name: "Team", price: 249, features: ["50 projects", "50 GB storage", "Team features"] },
    ],
    currency: "USD",
    period: "year",
    highlighted: "Team",
  },
};

export const Euro: Story = {
  args: {
    plans: [
      { name: "Free", price: 0, features: ["1 project", "100 MB storage"] },
      { name: "Plus", price: 19, features: ["Unlimited projects", "5 GB storage"] },
    ],
    currency: "EUR",
    period: "month",
    highlighted: "",
  },
};

export const Empty: Story = {
  args: {
    plans: [],
    currency: "USD",
    period: "month",
  },
};
