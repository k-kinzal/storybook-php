/**
 * typeMap.bindings demo: Interface → Concrete resolution
 *
 * Page's constructor takes `Renderable $content` (an interface).
 * Without typeMap, runner.php can't instantiate an interface.
 *
 * typeMap.bindings maps Renderable to HtmlBlock:
 *   "App\\Components\\Renderable": "App\\Components\\HtmlBlock"
 *
 * Now when the runner sees a Renderable-typed param, it creates
 * an HtmlBlock instead, using HtmlBlock's constructor signature
 * to match the args ($content, $tag).
 */
import type { Meta, StoryObj } from "storybook-php";
import { Page } from "./Page.php@render";

const meta: Meta<typeof Page> = {
  component: Page,
  title: "Bindings/Page (interface binding)",
};

export default meta;
type Story = StoryObj<typeof Page>;

export const Default: Story = {
  args: {
    title: "Welcome",
    content: { content: "Hello from an HtmlBlock, resolved via typeMap.bindings!", tag: "p" },
  },
};

export const WithDiv: Story = {
  args: {
    title: "Dashboard",
    content: { content: "This content block renders as a div element.", tag: "div" },
  },
};
