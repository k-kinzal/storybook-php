/** Callable type supported by the PHP runner */
export type PhpCallableType =
  | "classMethod"
  | "staticMethod"
  | "function"
  | "template"
  | "enumMethod";

/** Definition for a single PHP parameter/argument */
export interface PhpArgDef {
  type: string;
  required: boolean;
  position: number;
  nullable: boolean;
  default?: unknown;
  isVariadic?: boolean;
  isPromoted?: boolean;
  visibility?: "public" | "protected" | "private";
  enumType?: string;
  classType?: string;
  unionTypes?: string[];
  /** Valid values for select controls (e.g. enum case values, string option sets) */
  options?: (string | number | boolean)[];
  /** Element type for array/list parameters (e.g. "App\\Models\\Badge") */
  elementType?: string;
}

/** Map of argument name → definition */
export type PhpArgMap = Record<string, PhpArgDef>;

/** A PHP component descriptor (the virtual module export) */
export interface PhpComponent<TArgs extends Record<string, unknown> = Record<string, unknown>> {
  __php: true;
  __id: string;
  __type: PhpCallableType;
  __file: string;
  __class: string | null;
  __callable: string | null;
  __constructorArgs: PhpArgMap;
  __callableArgs: PhpArgMap;
  __publicArgs: PhpArgMap;
  /** Phantom type carrier for TArgs */
  __args?: TArgs;
}

/** PHP method metadata from parsing */
export interface PhpMethodMeta {
  name: string;
  isStatic: boolean;
  visibility: "public" | "protected" | "private";
  params: PhpParamMeta[];
  returnType: string | null;
}

/** PHP parameter metadata from parsing */
export interface PhpParamMeta {
  name: string;
  type: string | null;
  nullable: boolean;
  required: boolean;
  default?: unknown;
  isVariadic: boolean;
  isPromoted: boolean;
  visibility?: "public" | "protected" | "private";
  position: number;
}

/** PHP class metadata from parsing */
export interface PhpClassMeta {
  name: string;
  fqn: string;
  isAbstract: boolean;
  isFinal: boolean;
  isReadonly: boolean;
  isTrait: boolean;
  isInterface: boolean;
  extends: string | null;
  implements: string[];
  traits: string[];
  hasConstructor: boolean;
  constructorParams: PhpParamMeta[];
  methods: PhpMethodMeta[];
  isEnum: boolean;
  enumBackingType?: "string" | "int" | null;
  enumCases?: string[];
}

/** PHP standalone function metadata from parsing */
export interface PhpFunctionMeta {
  name: string;
  fqn: string;
  params: PhpParamMeta[];
  returnType: string | null;
}

/** Complete metadata for a parsed PHP file */
export interface PhpFileMeta {
  filePath: string;
  namespace: string | null;
  classes: PhpClassMeta[];
  functions: PhpFunctionMeta[];
}

/** Render request sent to the PHP runner */
export interface PhpRenderRequest {
  type: PhpCallableType;
  file: string;
  /** Original imported file path, used for adapter selection and diagnostics */
  sourceFile?: string | null;
  class: string | null;
  callable: string | null;
  args: Record<string, unknown>;
  /** Public Storybook args after build-time and per-story overrides */
  publicArgDefs?: PhpArgMap | null;
  /** Constructor parameter definitions for callable-backed stories */
  constructorArgDefs?: PhpArgMap | null;
  /** Invoked callable parameter definitions for callable-backed stories */
  callableArgDefs?: PhpArgMap | null;
  bootstrap?: string | null;
  /** Most specific per-request adapter override, composed inside the middleware chain */
  adapter?: string | null;
  /** Runtime-only bindings used while casting PHP objects */
  typeMap?: RuntimeTypeMap | null;
}

/** Browser-to-server render invoke request */
export interface PhpRenderInvokeRequest {
  /** Opaque registry id for a server-owned render plan */
  componentId: string;
  args: Record<string, unknown>;
  /** Per-story public args / bindings override */
  typeMap?: StoryTypeMap | null;
}

/** Response from the PHP runner */
export interface PhpRenderResponse {
  html: string;
  error?: string;
  trace?: string;
}

/** Server-owned render plan registered during virtual module generation */
export interface PhpRenderPlan {
  type: PhpCallableType;
  /** Executable PHP file path */
  file: string;
  /** Original imported file path */
  sourceFile: string;
  class: string | null;
  callable: string | null;
  adapter?: string | null;
}

/** Shared schema used by Vite, type generation, and TS editor support */
export interface PhpComponentSchema {
  exportName: string;
  renderPlan: PhpRenderPlan;
  constructorArgs: PhpArgMap;
  callableArgs: PhpArgMap;
  publicArgs: PhpArgMap;
}

// ---------------------------------------------------------------------------
// Type Map configuration (static type mapping)
// ---------------------------------------------------------------------------

/**
 * Override or supplement argument metadata.
 * String shorthand: just the PHP type name (e.g. "App\\Enums\\Status").
 * Object form: rich metadata with options, elementType, etc.
 */
export type ArgOverride =
  | string
  | {
      /** Override the PHP type */
      type?: string;
      /** Valid values for select controls (enum cases, string option sets) */
      options?: (string | number | boolean)[];
      /** Element type for array/list parameters */
      elementType?: string;
      nullable?: boolean;
      required?: boolean;
      default?: unknown;
    };

/** Target for a file mapping entry */
export interface FileMapTarget {
  /** Public Storybook args for this import target */
  args?: Record<string, string | ArgOverride>;
  /** Callable-specific public args overrides for PHP files with multiple callables */
  callables?: Record<
    string,
    {
      args?: Record<string, string | ArgOverride>;
    }
  >;
  /** Path to a PHP file to use as the type source instead */
  phpFile?: string;
  /** Method/callable name when using phpFile */
  callable?: string;
  /** Additional PHP files to parse for cross-file parent/trait resolution */
  includes?: string[];
  /**
   * Path to a PHP adapter file for this file or pattern.
   * Overrides the global `adapter` option for matching files.
   * The file must return a middleware callable:
   *   function (array $context, callable $next): array|string
   */
  adapter?: string;
}

/** Static type mapping configuration */
export interface TypeMapConfig {
  /** Map file paths to type information sources */
  files?: Record<string, FileMapTarget>;
  /** Map PHP type → PHP type (interface/abstract → concrete, DI-style) */
  bindings?: Record<string, string>;
}

/**
 * Per-story typeMap override.
 * Use via `parameters.typeMap` in Meta or StoryObj.
 */
export interface StoryTypeMap {
  /** Map PHP type → PHP type (interface/abstract → concrete, DI-style) */
  bindings?: Record<string, string>;
  /** Override the public Storybook args surface for the current story */
  args?: Record<string, string | ArgOverride>;
}

/** Runtime type information sent to the PHP runner */
export interface RuntimeTypeMap {
  bindings?: Record<string, string>;
}

/** Framework options for storybook-php */
export interface FrameworkOptions {
  /** Path to a PHP bootstrap file (autoloader, config, etc.) */
  bootstrap?: string;
  /** PHP binary path (default: 'php') */
  phpBinary?: string;
  /** Extra CLI options passed to the PHP binary before the runner script (e.g. ["-d", "memory_limit=512M"]) */
  phpOptions?: string[];
  /** Environment variables merged over process.env when spawning PHP */
  phpEnv?: Record<string, string>;
  /** Render timeout in milliseconds (default: 5000) */
  timeout?: number;
  /** Default method name when @method is omitted from import */
  defaultMethod?: string;
  /**
   * Path to a global PHP adapter middleware.
   * The file must return:
   *   function (array $context, callable $next): array|string
   * Middleware receives `publicArgs` plus hydrated `templateArgs`,
   * `constructorArgs`, and `methodArgs` where applicable.
   * Rewriting `publicArgs` before delegating to `$next($context)` causes inner
   * adapters and the core executor to receive freshly re-hydrated inputs.
   * Adapters may also replace resolved target args directly or terminate the chain.
   */
  adapter?: string;
  /** Static type mapping configuration */
  typeMap?: TypeMapConfig;
  /** @internal Resolved config directory for path resolution */
  _configDir?: string;
}

/**
 * @internal Pre-resolved adapter mappings from typeMap.files.
 * Used by PhpExecutor to resolve per-file adapters at runtime.
 */
export interface AdapterMap {
  /** Suffix-based patterns (e.g. ".blade.php" → adapter path) */
  patterns: Array<{ suffix: string; adapter: string }>;
  /** Exact file path → adapter path */
  files: Record<string, string>;
}

/** Storybook renderer type identifier */
export type PhpRenderer = {
  component: PhpComponent;
  storyResult: string;
  canvasElement: HTMLElement;
};
