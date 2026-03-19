import type { Meta, StoryObj } from "storybook-php";
import { Visibility } from "./Visibility.php@badge";

const meta: Meta<typeof Visibility> = {
  component: Visibility,
  title: "Enums/Visibility",
  argTypes: {
    _case: { control: "select", options: ["public", "private", "unlisted", "draft"] },
  },
};

export default meta;
type Story = StoryObj<typeof Visibility>;

export const Public: Story = {
  args: { _case: "public" },
};

export const Private: Story = {
  args: { _case: "private" },
};

export const Unlisted: Story = {
  args: { _case: "unlisted" },
};

export const Draft: Story = {
  args: { _case: "draft" },
};
