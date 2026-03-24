/**
 * typeMap.files[].includes demo: Cross-file parent class resolution
 *
 * InfoCard extends BaseCard, but they're in DIFFERENT files.
 * Without typeMap, the vite-plugin can't see BaseCard's constructor
 * params ($title, $variant) — it only searches the same file.
 *
 * typeMap.files tells it to also parse BaseCard.php:
 *   "../src/InfoCard.php": {
 *     includes: ["../src/BaseCard.php"],
 *   }
 *
 * Now the vite-plugin resolves the full constructor chain and
 * all args ($title, $message, $variant) appear in Storybook controls.
 */
import type { Meta, StoryObj } from "storybook-php";
import { InfoCard } from "./InfoCard.php@render";

const meta: Meta<typeof InfoCard> = {
  component: InfoCard,
  title: "Files/InfoCard (cross-file parent)",
};

export default meta;
type Story = StoryObj<typeof InfoCard>;

export const Default: Story = {
  args: {
    title: "Getting Started",
    message: "This card inherits $title and $variant from BaseCard in a separate file.",
  },
};

export const Primary: Story = {
  args: {
    title: "Important Notice",
    message: "The variant option comes from the parent class.",
    variant: "primary",
  },
};

export const Success: Story = {
  args: {
    title: "All Good",
    message: "Cross-file inheritance works with typeMap.files[].includes.",
    variant: "success",
  },
};
