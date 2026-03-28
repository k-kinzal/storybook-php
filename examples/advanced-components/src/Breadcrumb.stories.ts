import type { Meta, StoryObj } from "storybook-php";
import { Breadcrumb } from "./Breadcrumb.php@render";

const meta: Meta<typeof Breadcrumb> = {
  component: Breadcrumb,
  title: "Components/Breadcrumb",
  argTypes: {
    separator: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  args: { separator: " / ", segments: ["Home", "Products", "Widget"] },
};

export const ArrowSeparator: Story = {
  args: { separator: " > ", segments: ["Dashboard", "Settings", "Profile"] },
};

export const SingleItem: Story = {
  args: { segments: ["Home"] },
};

export const Empty: Story = {
  args: { segments: [] },
};
