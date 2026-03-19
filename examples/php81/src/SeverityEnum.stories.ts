import type { Meta, StoryObj } from "storybook-php";
import { SeverityEnum } from "./SeverityEnum.php@badge";

const meta: Meta<typeof SeverityEnum> = {
  component: SeverityEnum,
  title: "Enums/SeverityBadge",
  argTypes: {
    _case: { control: { type: "select", options: ["low", "medium", "high", "critical"] } },
  },
};

export default meta;
type Story = StoryObj<typeof SeverityEnum>;

export const Low: Story = { args: { _case: "low" } };
export const Medium: Story = { args: { _case: "medium" } };
export const High: Story = { args: { _case: "high" } };
export const Critical: Story = { args: { _case: "critical" } };
