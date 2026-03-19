import type { Meta, StoryObj } from "storybook-php";
import { EnumTransition } from "./EnumTransition.php@render";

const meta: Meta<typeof EnumTransition> = {
  component: EnumTransition,
  title: "Components/EnumTransition",
  argTypes: {
    from: { control: "select", options: ["draft", "review", "approved", "published", "archived"] },
    to: { control: "select", options: ["draft", "review", "approved", "published", "archived"] },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof EnumTransition>;

export const DraftToReview: Story = {
  args: { from: "draft", to: "review", label: "Submit for review" },
};

export const ReviewToApproved: Story = {
  args: { from: "review", to: "approved", label: "Approve changes" },
};

export const ApprovedToPublished: Story = {
  args: { from: "approved", to: "published", label: "Go live" },
};

export const Rollback: Story = {
  args: { from: "published", to: "draft", label: "Revert to draft" },
};

export const NoChange: Story = {
  args: { from: "review", to: "review" },
};
