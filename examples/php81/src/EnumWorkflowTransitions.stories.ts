import type { Meta, StoryObj } from "storybook-php";
import { WorkflowState } from "./EnumWorkflow.php@transitions";

const meta: Meta<typeof WorkflowState> = {
  component: WorkflowState,
  title: "Enums/Workflow/Transitions",
  argTypes: {
    _case: { control: "select", options: ["draft", "review", "approved", "published", "archived"] },
  },
};

export default meta;
type Story = StoryObj<typeof WorkflowState>;

export const FromDraft: Story = {
  args: { _case: "draft" },
};

export const FromReview: Story = {
  args: { _case: "review" },
};

export const FromApproved: Story = {
  args: { _case: "approved" },
};

export const FromPublished: Story = {
  args: { _case: "published" },
};

export const FinalState: Story = {
  args: { _case: "archived" },
};
