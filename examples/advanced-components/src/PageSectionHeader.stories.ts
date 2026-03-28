import type { Meta, StoryObj } from "storybook-php";
import { PageHeader } from "./PageSection.php@render";

const meta: Meta<typeof PageHeader> = {
  component: PageHeader,
  title: "Components/PageSection/Header",
  argTypes: {
    title: { control: "text" },
    logo: { control: "text" },
    sticky: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: { title: "Home", logo: "Acme" },
};

export const Sticky: Story = {
  args: { title: "Dashboard", logo: "MyApp", sticky: true },
};
