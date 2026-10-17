/**
 * types demo: Interface → Concrete resolution
 *
 * Page's constructor takes `Renderable $content` (an interface).
 * Without type mapping, runner.php can't instantiate an interface.
 *
 * types in main.ts maps Renderable → HtmlBlock globally.
 * Individual stories can override this via parameters.php.types to
 * bind to a different concrete class (e.g. PlainTextBlock).
 */
import type { Meta, StoryObj, PhpStoryParameters } from "storybook-php";
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
    content: { content: "Hello from an HtmlBlock, resolved via types!", tag: "p" },
  },
};

export const WithDiv: Story = {
  args: {
    title: "Dashboard",
    content: { content: "This content block renders as a div element.", tag: "div" },
  },
};

/**
 * Per-story type mapping override: bind Renderable to PlainTextBlock instead
 * of the global HtmlBlock. The content is rendered as preformatted text.
 */
export const PlainText: Story = {
  args: {
    title: "Plain Text View",
    content: { content: "This content uses PlainTextBlock via per-story type mapping override." },
  },
  parameters: {
    php: {
      types: {
        "App\\Components\\Renderable": "App\\Components\\PlainTextBlock",
      },
    } satisfies PhpStoryParameters,
  },
};
