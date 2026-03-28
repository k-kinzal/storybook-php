import type { Meta, StoryObj } from "storybook-php";
import settings from "./settings.php";

const meta: Meta<typeof settings> = {
  component: settings,
  title: "Templates/Settings",
};

export default meta;
type Story = StoryObj<typeof settings>;

export const Default: Story = {
  args: { title: "Application Settings" },
};

export const Custom: Story = {
  args: {
    title: "Server Config",
    sections: [
      { heading: "Network", settings: { "Bind Address": "0.0.0.0", Port: "8080", TLS: "enabled" } },
      { heading: "Cache", settings: { Driver: "redis", TTL: "3600s" } },
    ],
  },
};

export const Readonly: Story = {
  args: { title: "Read-Only View", readonly: true },
};
