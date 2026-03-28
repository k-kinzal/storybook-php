import type { Meta, StoryObj } from "storybook-php";
import { Nav } from "./Nav.php@render";

const meta: Meta<typeof Nav> = {
  component: Nav,
  title: "Components/Nav",
  argTypes: {
    brand: { control: "text" },
    subtitle: { control: "text" },
    sticky: { control: "boolean" },
    activeItem: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Nav>;

export const Default: Story = {
  args: { brand: "My App" },
};

export const WithSubtitle: Story = {
  args: { brand: "My App", subtitle: "Dashboard" },
};

export const Sticky: Story = {
  args: { brand: "My App", sticky: true, activeItem: "Settings" },
};

export const NoActiveItem: Story = {
  args: { brand: "My App", subtitle: "v2.0" },
};
