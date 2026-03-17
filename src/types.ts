/** Callable type supported by the PHP runner */
export type PhpCallableType =
  | 'classMethod'
  | 'staticMethod'
  | 'function'
  | 'template'
  | 'enumMethod';

/** Definition for a single PHP parameter/argument */
export interface PhpArgDef {
  type: string;
  required: boolean;
  position: number;
  nullable: boolean;
  default?: unknown;
  isVariadic?: boolean;
  isPromoted?: boolean;
  visibility?: 'public' | 'protected' | 'private';
  enumType?: string;
  classType?: string;
  unionTypes?: string[];
}

/** Map of argument name → definition */
export type PhpArgMap = Record<string, PhpArgDef>;

/** A PHP component descriptor (the virtual module export) */
export interface PhpComponent<TArgs extends Record<string, unknown> = Record<string, unknown>> {
  __php: true;
  __type: PhpCallableType;
  __file: string;
  __class: string | null;
  __callable: string | null;
  __constructorArgs: PhpArgMap;
  __callableArgs: PhpArgMap;
  __allArgs: PhpArgMap;
  /** Phantom type carrier for TArgs */
  __args?: TArgs;
}

/** PHP method metadata from parsing */
export interface PhpMethodMeta {
  name: string;
  isStatic: boolean;
  visibility: 'public' | 'protected' | 'private';
  params: PhpParamMeta[];
  returnType: string | null;
}

/** PHP parameter metadata from parsing */
export interface PhpParamMeta {
  name: string;
  type: string | null;
  nullable: boolean;
  required: boolean;
  default?: string;
  isVariadic: boolean;
  isPromoted: boolean;
  visibility?: 'public' | 'protected' | 'private';
  position: number;
}

/** PHP class metadata from parsing */
export interface PhpClassMeta {
  name: string;
  fqn: string;
  isAbstract: boolean;
  isFinal: boolean;
  isReadonly: boolean;
  extends: string | null;
  implements: string[];
  constructorParams: PhpParamMeta[];
  methods: PhpMethodMeta[];
  isEnum: boolean;
  enumBackingType?: 'string' | 'int' | null;
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
  class: string | null;
  callable: string | null;
  args: Record<string, unknown>;
  bootstrap?: string | null;
  adapter?: string | null;
}

/** Response from the PHP runner */
export interface PhpRenderResponse {
  html: string;
  error?: string;
  trace?: string;
}

/** Framework options for storybook-php */
export interface FrameworkOptions {
  /** Path to a PHP bootstrap file (autoloader, config, etc.) */
  bootstrap?: string;
  /** PHP binary path (default: 'php') */
  phpBinary?: string;
  /** Render timeout in milliseconds (default: 5000) */
  timeout?: number;
  /** Default method name when @method is omitted from import */
  defaultMethod?: string;
  /**
   * Path to a PHP adapter file.
   * The file must return a callable with signature:
   *   fn(mixed $result, string $buffered, ?object $instance): string
   * Used to customize how method return values are converted to HTML
   * (e.g. Laravel Component → resolveView + data).
   */
  adapter?: string;
}

/** Storybook renderer type identifier */
export type PhpRenderer = {
  component: PhpComponent;
  storyResult: string;
  canvasElement: HTMLElement;
};
