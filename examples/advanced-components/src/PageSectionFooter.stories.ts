import type { Meta, StoryObj } from "storybook-php";
import { PageFooter } from "./PageSection.php@render";

const meta: Meta<typeof PageFooter> = {
  component: PageFooter,
  title: "Components/PageSection/Footer",
  argTypes: {
    copyright: { control: "text" },
    year: { control: "number" },
    theme: { control: "select", options: ["dark", "light"] },
  },
};

export default meta;
type Story = StoryObj<typeof PageFooter>;

export const Dark: Story = {
  args: { copyright: "Acme Inc", year: 2025 },
};

export const Light: Story = {
  args: { copyright: "Acme Inc", year: 2025, theme: "light" },
};
