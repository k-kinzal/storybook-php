import type { Meta, StoryObj } from "storybook-php";
import { Tabs } from "./Tabs.php@render";

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  title: "Components/Tabs",
  argTypes: {
    activeIndex: { control: { type: "number", min: 0, max: 5 } },
    variant: { control: "select", options: ["default", "pills", "underline"] },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  args: {
    tabs: [
      { label: "Overview", content: "<p>Overview content goes here.</p>" },
      { label: "Details", content: "<p>Detailed information.</p>" },
      { label: "Reviews", content: "<p>User reviews section.</p>" },
    ],
    activeIndex: 0,
  },
};

export const SecondActive: Story = {
  args: {
    tabs: [
      { label: "Code", content: "<pre>const x = 42;</pre>" },
      { label: "Preview", content: "<p>Live preview here.</p>" },
    ],
    activeIndex: 1,
  },
};

export const Empty: Story = {
  args: { tabs: [] },
};
