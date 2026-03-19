import type { Meta, StoryObj } from "storybook-php";
import { HttpPort } from "./HttpPort.php@render";

const meta: Meta<typeof HttpPort> = {
  component: HttpPort,
  title: "Enums/HttpPort",
  argTypes: {
    _case: { control: "select", options: ["Http", "Https", "Dev", "Alt", "Proxy"] },
  },
};

export default meta;
type Story = StoryObj<typeof HttpPort>;

export const Https: Story = {
  args: { _case: "Https" },
};

export const Http: Story = {
  args: { _case: "Http" },
};

export const Dev: Story = {
  args: { _case: "Dev" },
};
