import type { Meta, StoryObj } from "storybook-php";
import { PageFooter } from "./PageParts.php@render";

const meta: Meta<typeof PageFooter> = {
  component: PageFooter,
  title: "Components/PageParts/Footer",
  argTypes: {
    copyright: { control: "text" },
    year: { control: "number" },
    showLinks: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof PageFooter>;

export const Default: Story = {
  args: { copyright: "Acme Inc." },
};

export const NoLinks: Story = {
  args: { copyright: "Acme Inc.", year: 2025, showLinks: false },
};
