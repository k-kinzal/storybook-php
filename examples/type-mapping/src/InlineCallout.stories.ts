/**
 * typeMap.files demo: Direct import of a non-PHP template file.
 *
 * InlineCallout.view is rendered as a template, but the args are still
 * cast on the PHP side using typeMap.files.args plus global bindings.
 */
import type { Meta, StoryObj } from "storybook-php";
import InlineCallout from "./InlineCallout.view";

const meta: Meta<typeof InlineCallout> = {
  component: InlineCallout,
  title: "Files/InlineCallout Direct Template",
};

export default meta;
type Story = StoryObj<typeof InlineCallout>;

export const Default: Story = {
  args: {
    title: "Direct template import",
    content: {
      content: "This HtmlBlock was instantiated from typeMap.files.args.",
      tag: "p",
    },
  },
};

export const Featured: Story = {
  args: {
    title: "Featured callout",
    content: {
      content: "Direct templates now receive PHP-cast args at runtime.",
      tag: "div",
    },
    featured: true,
    note: "note is nullable and optional",
  },
};
