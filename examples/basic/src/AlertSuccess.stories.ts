import type { Meta, StoryObj } from "storybook-php";
import { Alert } from "./Alert.php@success";

const meta: Meta<typeof Alert> = {
  component: Alert,
  title: "Components/AlertSuccess",
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: { message: "Operation completed successfully!" },
};

export const Dismissible: Story = {
  args: { message: "Changes saved.", dismissible: true },
};
