import type { Meta, StoryObj } from "storybook-php";
import { Modal } from "./Modal.php@render";

const meta: Meta<typeof Modal> = {
  component: Modal,
  title: "Components/Modal",
  argTypes: {
    title: { control: "text" },
    body: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: { title: "Confirm Action", body: "Are you sure you want to proceed?" },
};

export const Large: Story = {
  args: { title: "Terms of Service", body: "Please read and accept the terms...", size: "lg" },
};

export const Small: Story = {
  args: { title: "Quick Tip", body: "Press Ctrl+S to save.", size: "sm" },
};

export const NoBody: Story = {
  args: { title: "Empty Modal" },
};
