import type { Meta, StoryObj } from "storybook-php";
import { InfoPanel } from "./PanelVariant.php@render";

const meta: Meta<typeof InfoPanel> = {
  component: InfoPanel,
  title: "Components/PanelVariant/Info",
  argTypes: {
    title: { control: "text" },
    content: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof InfoPanel>;

export const Default: Story = {
  args: { title: "Information", content: "This is an informational message." },
};

export const Tip: Story = {
  args: { title: "Pro Tip", content: "You can use keyboard shortcuts to navigate faster." },
};
