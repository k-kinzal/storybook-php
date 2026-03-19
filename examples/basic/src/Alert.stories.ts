import type { Meta, StoryObj } from "storybook-php";
import { Alert } from "./Alert.php@danger";

const meta: Meta<typeof Alert> = {
  component: Alert,
  title: "Components/Alert",
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Danger: Story = {
  args: { message: "Something went wrong!", dismissible: false },
};

export const Dismissible: Story = {
  args: { message: "You can dismiss this alert.", dismissible: true },
};
