import type { Meta, StoryObj } from "storybook-php";
import { renderBanner } from "./renderHtml.php@renderBanner";

const meta: Meta<typeof renderBanner> = {
  component: renderBanner,
  title: "Functions/RenderBanner",
  argTypes: {
    title: { control: "text" },
    subtitle: { control: "text" },
    bg: { control: "color" },
  },
};

export default meta;
type Story = StoryObj<typeof renderBanner>;

export const Default: Story = {
  args: { title: "Welcome" },
};

export const WithSubtitle: Story = {
  args: { title: "New Release", subtitle: "Check out the latest features", bg: "#7c3aed" },
};

export const CustomColor: Story = {
  args: { title: "Sale", subtitle: "50% off everything", bg: "#dc2626" },
};
