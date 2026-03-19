import type { Meta, StoryObj } from "storybook-php";
import { WorkflowState } from "./EnumWorkflow.php@diagram";

const meta: Meta<typeof WorkflowState> = {
  component: WorkflowState,
  title: "Enums/Workflow/Diagram",
};

export default meta;
type Story = StoryObj<typeof WorkflowState>;

export const Default: Story = {};
