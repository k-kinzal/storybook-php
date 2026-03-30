/**
 * typeMap.files[*].args demo: Type override for an untyped PHP parameter.
 *
 * The constructor accepts `$content` without a native type. typeMap.files[*].args
 * tells the runtime to instantiate HtmlBlock from the Storybook object.
 */
import type { Meta, StoryObj } from "storybook-php";
import { UntypedBlock } from "./UntypedBlock.php@render";

const meta: Meta<typeof UntypedBlock> = {
  component: UntypedBlock,
  title: "Args/UntypedBlock Type Override",
};

export default meta;
type Story = StoryObj<typeof UntypedBlock>;

export const Default: Story = {
  args: {
    title: "Untyped content",
    content: { content: "Resolved through typeMap.files[*].args.type", tag: "p" },
  },
};

export const WithDiv: Story = {
  args: {
    title: "Different tag",
    content: { content: "The runtime still constructs HtmlBlock.", tag: "div" },
  },
};
