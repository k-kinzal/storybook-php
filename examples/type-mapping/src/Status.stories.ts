/**
 * typeMap.files[*].args demo: Enum case values
 *
 * The parser extracts enum case NAMES (Active, Inactive, ...)
 * but not the backing VALUES (active, inactive, ...).
 * typeMap.files[*].args provides these values so the select control works.
 *
 * Config in main.ts:
 *   "../src/Status.php": { args: { _case: { options: [...] } } }
 */
import type { Meta, StoryObj } from "storybook-php";
import { Status } from "./Status.php@badge";

const meta: Meta<typeof Status> = {
  component: Status,
  title: "Args/Status Enum",
};

export default meta;
type Story = StoryObj<typeof Status>;

export const Active: Story = {
  args: { _case: "active" },
};

export const Pending: Story = {
  args: { _case: "pending" },
};

export const Archived: Story = {
  args: { _case: "archived" },
};
