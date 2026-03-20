import type { Meta, StoryObj } from "storybook-php";
import { ContactCard } from "./ContactCard.php@render";

const meta: Meta<typeof ContactCard> = {
  component: ContactCard,
  title: "Patterns/AutoloadedNested",
  argTypes: {
    name: { control: "text" },
    phone: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof ContactCard>;

export const Default: Story = {
  args: {
    name: "Jane Smith",
    address: {
      street: "123 Main St",
      city: "San Francisco",
      country: { code: "US", name: "United States" },
    },
    phone: "+1 555-0123",
  },
};

export const UK: Story = {
  args: {
    name: "John Doe",
    address: {
      street: "10 Downing St",
      city: "London",
      country: { code: "GB", name: "United Kingdom" },
    },
  },
};

export const Japan: Story = {
  args: {
    name: "Taro Yamada",
    address: { street: "1-1 Chiyoda", city: "Tokyo", country: { code: "JP", name: "Japan" } },
    phone: "+81 3-1234-5678",
  },
};
