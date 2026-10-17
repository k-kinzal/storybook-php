import { dirname, isAbsolute, resolve } from "node:path";
import type {
  AdapterMap,
  ArgOverride,
  ComponentClassConfig,
  ComponentFileConfig,
  FrameworkOptions,
  TypeMappings,
} from "../../types.js";

export const PHP_IMPORT_RE: RegExp = /\.php(?:@(\w+))?$/;
export const VIRTUAL_PREFIX = "\0storybook-php:";

export interface ResolvedComponentFileConfig {
  args?: Record<string, string | ArgOverride>;
  callables?: Record<
    string,
    {
      args?: Record<string, string | ArgOverride>;
    }
  >;
  phpFile?: string;
  callable?: string;
  includes?: string[];
  adapter?: string;
}

export interface ResolvedFileMap {
  exact: Record<string, ResolvedComponentFileConfig>;
  patterns: Array<{ suffix: string; target: ResolvedComponentFileConfig }>;
}

export interface ResolvedFrameworkOptions {
  configDir: string;
  phpBinary: string;
  phpOptions: string[];
  phpEnv: Record<string, string> | null;
  timeout: number;
  bootstrap: string | null;
  adapter: string | null;
  defaultMethod: string | null;
  components?: {
    files?: ResolvedFileMap;
    classes?: Record<string, ComponentClassConfig>;
  };
  types?: TypeMappings;
  adapterMap: AdapterMap | null;
}

export interface ResolvedImportSource {
  sourceFile: string;
  callableName: string | null;
  mapped: boolean;
}

export function resolveFrameworkOptions(options: FrameworkOptions = {}): ResolvedFrameworkOptions {
  if ("typeMap" in options) {
    throw new Error("typeMap is no longer supported. Use components and types.");
  }
  const configDir = options._configDir ?? process.cwd();
  const resolvedFiles = resolveComponentFiles(options.components?.files, configDir);
  const resolvedComponent =
    resolvedFiles || options.components?.classes
      ? {
          ...(resolvedFiles ? { files: resolvedFiles } : {}),
          ...(options.components?.classes ? { classes: options.components.classes } : {}),
        }
      : null;

  return {
    configDir,
    phpBinary: options.phpBinary ?? "php",
    phpOptions: options.phpOptions ?? [],
    phpEnv: options.phpEnv ?? null,
    timeout: options.timeout ?? 5000,
    bootstrap: options.bootstrap ?? null,
    adapter: options.adapter ?? null,
    defaultMethod: options.defaultMethod ?? null,
    ...(resolvedComponent ? { components: resolvedComponent } : {}),
    ...(options.types ? { types: options.types } : {}),
    adapterMap: resolveAdapterMap(resolvedFiles),
  };
}

export function resolveImportSource(
  source: string,
  importer: string | undefined,
  options: ResolvedFrameworkOptions,
): ResolvedImportSource | null {
  if (options.components?.files && importer) {
    const sourcePath = stripCallableSuffix(source);
    const absPath = isAbsolute(sourcePath) ? sourcePath : resolve(dirname(importer), sourcePath);
    const mapping = findResolvedFileMapping(absPath, options.components.files);
    if (mapping) {
      return {
        sourceFile: absPath,
        callableName: extractCallableName(source) ?? options.defaultMethod,
        mapped: true,
      };
    }
  }

  const match = source.match(PHP_IMPORT_RE);
  if (!match) {
    return null;
  }

  const phpPath = stripCallableSuffix(source);
  if (!isAbsolute(phpPath) && !importer) {
    return null;
  }

  return {
    sourceFile: isAbsolute(phpPath) ? phpPath : resolve(dirname(importer!), phpPath),
    callableName: match[1] ?? options.defaultMethod,
    mapped: false,
  };
}

export function extractCallableName(specifier: string): string | null {
  return specifier.match(/@(\w+)$/)?.[1] ?? null;
}

export function stripCallableSuffix(specifier: string): string {
  return specifier.replace(/@\w+$/, "");
}

export function findResolvedFileMapping(
  absPath: string,
  fileMap: ResolvedFileMap,
): ResolvedComponentFileConfig | null {
  let exactMatch: ResolvedComponentFileConfig | undefined;
  let patternMatch: ResolvedComponentFileConfig | undefined;
  let patternSuffixLen = 0;

  exactMatch = fileMap.exact[absPath];

  for (const { suffix, target } of fileMap.patterns) {
    if (absPath.endsWith(suffix) && suffix.length > patternSuffixLen) {
      patternMatch = target;
      patternSuffixLen = suffix.length;
    }
  }

  if (!exactMatch && !patternMatch) return null;
  if (!patternMatch) return exactMatch!;
  if (!exactMatch) return patternMatch!;

  return mergeComponentFileConfigs(patternMatch, exactMatch);
}

export function resolveSourceFileMapping(
  sourceFile: string,
  options: Pick<ResolvedFrameworkOptions, "components">,
): ResolvedComponentFileConfig | null {
  return options.components?.files
    ? findResolvedFileMapping(sourceFile, options.components.files)
    : null;
}

export function resolveAdapterForSourceFile(
  sourceFile: string,
  options: ResolvedFrameworkOptions,
): string | null {
  const mapping = resolveSourceFileMapping(sourceFile, options);
  if (mapping?.adapter) {
    return mapping.adapter;
  }
  return options.adapter;
}

function resolveComponentFiles(
  fileMap: Record<string, ComponentFileConfig> | undefined,
  configDir: string,
): ResolvedFileMap | undefined {
  if (!fileMap) return undefined;

  const exact: Record<string, ResolvedComponentFileConfig> = {};
  const patterns: Array<{ suffix: string; target: ResolvedComponentFileConfig }> = [];

  for (const [key, target] of Object.entries(fileMap)) {
    const resolvedTarget: ResolvedComponentFileConfig = {};

    if (target.args !== undefined) resolvedTarget.args = target.args;
    if (target.callables !== undefined) {
      resolvedTarget.callables = Object.fromEntries(
        Object.entries(target.callables).map(([callableName, callableTarget]) => [
          callableName,
          callableTarget.args !== undefined ? { args: callableTarget.args } : {},
        ]),
      );
    }
    if (target.phpFile !== undefined) {
      resolvedTarget.phpFile = isAbsolute(target.phpFile)
        ? target.phpFile
        : resolve(configDir, target.phpFile);
    }
    if (target.callable !== undefined) resolvedTarget.callable = target.callable;
    if (target.includes !== undefined) {
      resolvedTarget.includes = target.includes.map((includePath) =>
        isAbsolute(includePath) ? includePath : resolve(configDir, includePath),
      );
    }
    if (target.adapter !== undefined) {
      resolvedTarget.adapter = isAbsolute(target.adapter)
        ? target.adapter
        : resolve(configDir, target.adapter);
    }

    if (key.startsWith("*")) {
      patterns.push({ suffix: key.slice(1), target: resolvedTarget });
    } else {
      const resolvedKey = isAbsolute(key) ? key : resolve(configDir, key);
      exact[resolvedKey] = resolvedTarget;
    }
  }

  return { exact, patterns };
}

function mergeComponentFileConfigs(
  pattern: ResolvedComponentFileConfig,
  exact: ResolvedComponentFileConfig,
): ResolvedComponentFileConfig {
  const result: ResolvedComponentFileConfig = {};

  const args = exact.args ?? pattern.args;
  if (args !== undefined) result.args = args;

  const callableKeys = new Set([
    ...Object.keys(pattern.callables ?? {}),
    ...Object.keys(exact.callables ?? {}),
  ]);
  if (callableKeys.size > 0) {
    result.callables = {};
    for (const callableName of callableKeys) {
      const patternCallable = pattern.callables?.[callableName];
      const exactCallable = exact.callables?.[callableName];
      const callableTarget: NonNullable<ResolvedComponentFileConfig["callables"]>[string] = {};
      const args = exactCallable?.args ?? patternCallable?.args;
      if (args !== undefined) {
        callableTarget.args = args;
      }
      result.callables[callableName] = callableTarget;
    }
  }

  const phpFile = exact.phpFile ?? pattern.phpFile;
  if (phpFile !== undefined) result.phpFile = phpFile;

  const callable = exact.callable ?? pattern.callable;
  if (callable !== undefined) result.callable = callable;

  const includes = exact.includes ?? pattern.includes;
  if (includes !== undefined) result.includes = includes;

  const adapter = exact.adapter ?? pattern.adapter;
  if (adapter !== undefined) result.adapter = adapter;

  return result;
}

function resolveAdapterMap(fileMap: ResolvedFileMap | undefined): AdapterMap | null {
  if (!fileMap) return null;

  const patterns: AdapterMap["patterns"] = [];
  const files: AdapterMap["files"] = {};

  for (const [path, target] of Object.entries(fileMap.exact)) {
    if (target.adapter) {
      files[path] = target.adapter;
    }
  }

  for (const { suffix, target } of fileMap.patterns) {
    if (target.adapter) {
      patterns.push({ suffix, adapter: target.adapter });
    }
  }

  return patterns.length > 0 || Object.keys(files).length > 0 ? { patterns, files } : null;
}
