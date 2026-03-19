import type { Meta, StoryObj } from "storybook-php";
import { Panel } from "./Panel.php@render";

const meta: Meta<typeof Panel> = {
  component: Panel,
  title: "Components/Panel",
  argTypes: {
    heading: { control: "text" },
    body: { control: "text" },
    collapsible: { control: "boolean" },
    collapsed: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Panel>;

export const Default: Story = {
  args: { heading: "Panel Title", body: "This is the panel body content." },
};

export const Collapsible: Story = {
  args: { heading: "Collapsible Panel", body: "Click the arrow to collapse.", collapsible: true },
};

export const Collapsed: Story = {
  args: {
    heading: "Collapsed Panel",
    body: "This content is hidden.",
    collapsible: true,
    collapsed: true,
  },
};

export const HeaderOnly: Story = {
  args: { heading: "Header Only" },
};
