import type { Meta, StoryObj } from "storybook-php";
import { WorkflowState } from "./EnumWorkflow.php@badge";

const meta: Meta<typeof WorkflowState> = {
  component: WorkflowState,
  title: "Enums/Workflow/Badge",
  argTypes: {
    _case: { control: "select", options: ["draft", "review", "approved", "published", "archived"] },
  },
};

export default meta;
type Story = StoryObj<typeof WorkflowState>;

export const Draft: Story = {
  args: { _case: "draft" },
};

export const Review: Story = {
  args: { _case: "review" },
};

export const Approved: Story = {
  args: { _case: "approved" },
};

export const Published: Story = {
  args: { _case: "published" },
};

export const Archived: Story = {
  args: { _case: "archived" },
};
