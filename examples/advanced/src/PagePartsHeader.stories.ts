import type { Meta, StoryObj } from "storybook-php";
import { PageHeader } from "./PageParts.php@render";

const meta: Meta<typeof PageHeader> = {
  component: PageHeader,
  title: "Components/PageParts/Header",
  argTypes: {
    title: { control: "text" },
    subtitle: { control: "text" },
    sticky: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: { title: "My Application" },
};

export const WithSubtitle: Story = {
  args: { title: "Dashboard", subtitle: "Overview of your account" },
};

export const Sticky: Story = {
  args: { title: "Sticky Header", subtitle: "This header stays at the top", sticky: true },
};
