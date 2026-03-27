/**
 * typeMap.bindings demo: Interface → Concrete resolution
 *
 * Page's constructor takes `Renderable $content` (an interface).
 * Without typeMap, runner.php can't instantiate an interface.
 *
 * typeMap.bindings in main.ts maps Renderable → HtmlBlock globally.
 * Individual stories can override this via parameters.typeMap to
 * bind to a different concrete class (e.g. PlainTextBlock).
 */
import type { Meta, StoryObj, StoryTypeMap } from "storybook-php";
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

/**
 * Per-story typeMap override: bind Renderable to PlainTextBlock instead
 * of the global HtmlBlock. The content is rendered as preformatted text.
 */
export const PlainText: Story = {
  args: {
    title: "Plain Text View",
    content: { content: "This content uses PlainTextBlock via per-story typeMap override." },
  },
  parameters: {
    typeMap: {
      bindings: {
        "App\\Components\\Renderable": "App\\Components\\PlainTextBlock",
      },
    } satisfies StoryTypeMap,
  },
};
