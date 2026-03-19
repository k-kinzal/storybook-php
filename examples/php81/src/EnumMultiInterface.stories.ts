import type { Meta, StoryObj } from "storybook-php";
import { EnumMultiInterface } from "./EnumMultiInterface.php@menuItem";

const meta: Meta<typeof EnumMultiInterface> = {
  component: EnumMultiInterface,
  title: "Enums/EnumMultiInterface",
  argTypes: {
    _case: { control: "select", options: ["home", "settings", "profile", "logout"] },
  },
};

export default meta;
type Story = StoryObj<typeof EnumMultiInterface>;

export const Home: Story = {
  args: { _case: "home" },
};

export const Settings: Story = {
  args: { _case: "settings" },
};

export const Profile: Story = {
  args: { _case: "profile" },
};

export const Logout: Story = {
  args: { _case: "logout" },
};
