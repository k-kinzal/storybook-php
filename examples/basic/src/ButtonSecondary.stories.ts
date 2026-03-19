import type { Meta, StoryObj } from "storybook-php";
import { Button } from "./Button.php@secondary";

const meta: Meta<typeof Button> = {
  component: Button,
  title: "Components/Button/Secondary",
  argTypes: {
    label: { control: "text" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { label: "Secondary Button" },
};
