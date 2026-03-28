import type { Meta, StoryObj } from "storybook-php";
import { Timeline } from "./Timeline.php@render";

const meta: Meta<typeof Timeline> = {
  component: Timeline,
  title: "Components/Timeline",
  argTypes: {
    reversed: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Timeline>;

export const Default: Story = {
  args: {
    events: [
      { date: "2024-01-15", title: "Project Started", description: "Initial commit and setup" },
      { date: "2024-03-01", title: "Beta Release", description: "First public beta" },
      { date: "2024-06-10", title: "v1.0 Launch", description: "Stable release" },
    ],
  },
};

export const Reversed: Story = {
  args: {
    events: [
      { date: "Mon", title: "Design Review" },
      { date: "Wed", title: "Sprint Planning" },
      { date: "Fri", title: "Demo Day" },
    ],
    reversed: true,
  },
};

export const Empty: Story = {
  args: { events: [] },
};

export const SingleEvent: Story = {
  args: {
    events: [{ date: "Today", title: "New Feature", description: "Added timeline component" }],
  },
};
