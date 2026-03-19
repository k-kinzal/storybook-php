import type { Meta, StoryObj } from "storybook-php";
import { breadcrumbTrail } from "./breadcrumbTrail.php@breadcrumbTrail";

const meta: Meta<typeof breadcrumbTrail> = {
  component: breadcrumbTrail,
  title: "Functions/BreadcrumbTrail",
  argTypes: {
    separator: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof breadcrumbTrail>;

export const Default: Story = {
  args: { separator: " / ", segments: ["Home", "Products", "Electronics", "Phones"] },
};

export const Arrow: Story = {
  args: { separator: " > ", segments: ["Dashboard", "Settings", "Profile"] },
};

export const Single: Story = {
  args: { separator: " / ", segments: ["Home"] },
};
