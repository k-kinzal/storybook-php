import type { Meta, StoryObj } from "storybook-php";
import PricingTemplate from "./templates/pricing.php";

const meta: Meta<typeof PricingTemplate> = {
  component: PricingTemplate,
  title: "Templates/Pricing",
  argTypes: {
    currency: { control: "select", options: ["USD", "EUR", "GBP", "JPY"] },
    period: { control: "select", options: ["month", "year"] },
    highlighted: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof PricingTemplate>;

export const Default: Story = {
  args: {
    plans: [
      { name: "Starter", price: 9, features: ["5 Projects", "1 GB Storage"] },
      {
        name: "Pro",
        price: 29,
        features: ["Unlimited Projects", "10 GB Storage", "Priority Support"],
      },
      { name: "Enterprise", price: 99, features: ["Everything in Pro", "Custom Domain", "SSO"] },
    ],
    currency: "USD",
    period: "month",
    highlighted: "Pro",
  },
};

export const EuroPricing: Story = {
  args: {
    plans: [
      { name: "Basic", price: 19, features: ["10 Users", "API Access"] },
      { name: "Premium", price: 49, features: ["100 Users", "API Access", "Analytics"] },
    ],
    currency: "EUR",
    period: "year",
    highlighted: "Premium",
  },
};

export const Empty: Story = {
  args: { plans: [] },
};
