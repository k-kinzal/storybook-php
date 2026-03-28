import type { PhpComponent, PhpRenderRequest, StoryTypeMap } from "./types.js";

const RENDER_ENDPOINT = "/__storybook_php/render";
const PHP_PLACEHOLDER = "<!-- storybook-php-content -->";

let currentAbortController: AbortController | null = null;

interface RenderContext {
  storyContext: {
    component?: PhpComponent;
    args: Record<string, unknown>;
    parameters?: ({ typeMap?: StoryTypeMap } & Record<string, unknown>) | undefined;
    name: string;
    title: string;
    id: string;
  };
  storyFn: () => string;
  showMain: () => void;
  showError: (error: { title: string; description: string }) => void;
}

export async function renderToCanvas(
  { storyContext, storyFn, showMain, showError }: RenderContext,
  canvasElement: HTMLElement,
): Promise<void> {
  const { component, args, parameters } = storyContext;

  // If not a PHP component, use storyFn as plain HTML fallback
  if (!component || !isPhpComponent(component)) {
    canvasElement.innerHTML = storyFn();
    showMain();
    return;
  }

  // Get the decorated story output (includes placeholder wrapped by decorators)
  const decoratedOutput = storyFn();

  // Cancel any in-flight request
  if (currentAbortController) {
    currentAbortController.abort();
  }
  currentAbortController = new AbortController();
  const { signal } = currentAbortController;

  const storyTypeMap = parameters?.["typeMap"];

  const request: PhpRenderRequest = {
    type: component.__type,
    file: component.__file,
    class: component.__class,
    callable: component.__callable,
    args: args ?? {},
    ...(storyTypeMap ? { typeMap: storyTypeMap } : {}),
  };

  try {
    const response = await fetch(RENDER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });

    if (signal.aborted) return;

    const result = await response.json();

    if (signal.aborted) return;

    if (result.error) {
      showError({
        title: "PHP Render Error",
        description: result.error + (result.trace ? "\n\n" + result.trace : ""),
      });
      return;
    }

    // If decorators wrapped the placeholder, inject PHP HTML into the wrapper
    if (decoratedOutput.includes(PHP_PLACEHOLDER)) {
      canvasElement.innerHTML = decoratedOutput.replace(PHP_PLACEHOLDER, result.html);
    } else {
      canvasElement.innerHTML = result.html;
    }
    reExecuteScripts(canvasElement);
    showMain();
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return; // Stale request cancelled
    }
    showError({
      title: "PHP Render Error",
      description: err instanceof Error ? err.message : String(err),
    });
  }
}

/** Re-execute <script> tags in rendered HTML */
function reExecuteScripts(container: HTMLElement): void {
  const scripts = container.querySelectorAll("script");
  scripts.forEach((oldScript) => {
    const newScript = document.createElement("script");
    for (const attr of oldScript.attributes) {
      newScript.setAttribute(attr.name, attr.value);
    }
    newScript.textContent = oldScript.textContent;
    oldScript.parentNode?.replaceChild(newScript, oldScript);
  });
}

function isPhpComponent(value: unknown): value is PhpComponent {
  return (
    typeof value === "object" &&
    value !== null &&
    "__php" in value &&
    (value as Record<string, unknown>)["__php"] === true
  );
}

/** Default render function for Storybook — returns a placeholder that
 *  decorators can wrap. renderToCanvas replaces it with the PHP output. */
export function render(_args: Record<string, unknown>): string {
  return PHP_PLACEHOLDER;
}

export const parameters = {
  renderer: "storybook-php",
};
