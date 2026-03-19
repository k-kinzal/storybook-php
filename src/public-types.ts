import type { PhpComponent, PhpRenderer } from "./types.js";

/** Extract the args type from a PhpComponent */
type ArgsFromComponent<C> = C extends PhpComponent<infer A> ? A : Record<string, unknown>;

/** Story metadata — equivalent to Storybook's Meta */
export interface Meta<TComponent extends PhpComponent = PhpComponent> {
  component?: TComponent;
  title?: string;
  tags?: string[];
  args?: Partial<ArgsFromComponent<TComponent>>;
  argTypes?: Record<string, ArgType>;
  decorators?: Decorator[];
  parameters?: Record<string, unknown>;
  render?: (args: ArgsFromComponent<TComponent>) => string;
}

/** Single story object */
export interface StoryObj<TComponent extends PhpComponent = PhpComponent> {
  args?: Partial<ArgsFromComponent<TComponent>>;
  argTypes?: Record<string, ArgType>;
  decorators?: Decorator[];
  parameters?: Record<string, unknown>;
  render?: (args: ArgsFromComponent<TComponent>) => string;
  name?: string;
  tags?: string[];
  play?: (context: StoryContext) => Promise<void> | void;
}

/** Shorthand: Story = StoryObj */
export type Story = StoryObj;

/** Story function type */
export type StoryFn<TComponent extends PhpComponent = PhpComponent> = (
  args: ArgsFromComponent<TComponent>,
) => string;

/** Decorator function */
export type Decorator = (storyFn: () => string, context: StoryContext) => string;

/** Story context passed to decorators and play functions */
export interface StoryContext {
  args: Record<string, unknown>;
  argTypes: Record<string, ArgType>;
  component: PhpComponent | undefined;
  canvasElement: HTMLElement;
  name: string;
  title: string;
  id: string;
}

/** Arg type definition for controls */
export interface ArgType {
  control?:
    | string
    | {
        type: string;
        min?: number;
        max?: number;
        step?: number;
        options?: unknown[];
        labels?: Record<string, string>;
      };
  options?: unknown[];
  description?: string;
  defaultValue?: unknown;
  name?: string;
  type?: { name: string; required?: boolean };
  table?: {
    type?: { summary: string; detail?: string };
    defaultValue?: { summary: string; detail?: string };
    category?: string;
  };
}

export type { PhpComponent, PhpRenderer };
