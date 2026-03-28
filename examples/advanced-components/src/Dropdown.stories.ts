import type { Meta, StoryObj } from "storybook-php";
import { Dropdown } from "./Dropdown.php@toggle";

const meta: Meta<typeof Dropdown> = {
  component: Dropdown,
  title: "Components/Dropdown",
  argTypes: {
    label: { control: "text" },
    items: { control: "object" },
    open: { control: "boolean" },
    placeholder: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

export const Closed: Story = {
  args: { label: "Options", items: ["Edit", "Delete", "Archive"] },
};

export const Open: Story = {
  args: { label: "Actions", items: ["Copy", "Move", "Rename"], open: true },
};

export const WithPlaceholder: Story = {
  args: {
    label: "Filter",
    items: ["Active", "Inactive", "Pending"],
    open: true,
    placeholder: "Choose status...",
  },
};
