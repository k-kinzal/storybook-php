import type { Meta, StoryObj } from "storybook-php";
import { ProjectBoard } from "./ProjectBoard.php@render";

const meta: Meta<typeof ProjectBoard> = {
  component: ProjectBoard,
  title: "Patterns/ProjectBoard",
  argTypes: {
    name: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof ProjectBoard>;

export const FullProject: Story = {
  args: {
    name: "Storybook PHP",
    description: "A Storybook renderer for PHP components",
    members: [
      {
        name: "Alice",
        role: "Lead",
        skills: [
          { name: "PHP", level: "expert" },
          { name: "TypeScript", level: "intermediate" },
        ],
      },
      {
        name: "Bob",
        role: "Developer",
        skills: [
          { name: "PHP", level: "intermediate" },
          { name: "CSS", level: "expert" },
        ],
      },
    ],
    milestones: [
      {
        name: "v1.0 Release",
        tasks: [
          { title: "Parser", status: "done", assignee: "Alice" },
          { title: "Runner", status: "done", assignee: "Bob" },
          { title: "Docs", status: "in_progress", assignee: "Alice" },
        ],
      },
      {
        name: "v2.0 Planning",
        tasks: [
          { title: "Array casting", status: "in_progress", assignee: "Alice" },
          { title: "Collection support", status: "todo" },
        ],
      },
    ],
  },
};

export const MinimalProject: Story = {
  args: {
    name: "Quick Prototype",
    members: [
      {
        name: "Charlie",
        role: "Solo Developer",
      },
    ],
  },
};

export const EmptyBoard: Story = {
  args: {
    name: "New Project",
    members: [],
    milestones: [],
    description: "Just getting started",
  },
};
