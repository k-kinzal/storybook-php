import type { Meta, StoryObj } from "storybook-php";
import TabsTemplate from "./tabs.php";

const meta: Meta = {
  component: TabsTemplate,
  title: "Templates/Tabs",
  argTypes: {
    tabs: { control: "object" },
    activeIndex: { control: "number" },
    variant: { control: "select", options: ["default", "pills"] },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    tabs: [
      { label: "Overview", content: "This is the overview content with a summary of the project." },
      { label: "Details", content: "Detailed information about configuration and setup." },
      { label: "Settings", content: "Manage your preferences and account settings here." },
    ],
    activeIndex: 0,
  },
};

export const SecondTab: Story = {
  args: {
    tabs: [
      { label: "Overview", content: "Overview content." },
      { label: "Details", content: "This tab is currently active, showing detailed information." },
      { label: "Settings", content: "Settings content." },
    ],
    activeIndex: 1,
  },
};

export const Pills: Story = {
  args: {
    tabs: [
      { label: "All", content: "Showing all items in the list." },
      { label: "Active", content: "Only active items are displayed." },
      { label: "Archived", content: "Archived items from previous periods." },
    ],
    activeIndex: 0,
    variant: "pills",
  },
};

export const Empty: Story = {
  args: { tabs: [] },
};
