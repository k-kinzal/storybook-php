import { dirname, isAbsolute, resolve } from "node:path";
import type {
  AdapterMap,
  ArgOverride,
  FileMapTarget,
  FrameworkOptions,
  StoryTypeMap,
  TypeMapConfig,
} from "./types.js";

export const PHP_IMPORT_RE: RegExp = /\.php(?:@(\w+))?$/;
export const VIRTUAL_PREFIX = "\0storybook-php:";

export interface ResolvedFileMapTarget {
  args?: Record<string, string | ArgOverride>;
  phpFile?: string;
  callable?: string;
  includes?: string[];
  adapter?: string;
}

export interface ResolvedFileMap {
  exact: Record<string, ResolvedFileMapTarget>;
  patterns: Array<{ suffix: string; target: ResolvedFileMapTarget }>;
}

export interface ResolvedFrameworkOptions {
  configDir: string;
  phpBinary: string;
  timeout: number;
  bootstrap: string | null;
  adapter: string | null;
  defaultMethod: string | null;
  typeMap?: {
    files?: ResolvedFileMap;
    bindings?: Record<string, string>;
    args?: TypeMapConfig["args"];
  };
  adapterMap: AdapterMap | null;
}

export interface ResolvedImportSource {
  sourceFile: string;
  callableName: string | null;
  mapped: boolean;
}

export function resolveFrameworkOptions(options: FrameworkOptions = {}): ResolvedFrameworkOptions {
  const configDir = options._configDir ?? process.cwd();
  const resolvedFiles = resolveTypeMapFiles(options.typeMap?.files, configDir);
  const resolvedTypeMap =
    resolvedFiles || options.typeMap?.bindings || options.typeMap?.args
      ? {
          ...(resolvedFiles ? { files: resolvedFiles } : {}),
          ...(options.typeMap?.bindings ? { bindings: options.typeMap.bindings } : {}),
          ...(options.typeMap?.args ? { args: options.typeMap.args } : {}),
        }
      : null;

  return {
    configDir,
    phpBinary: options.phpBinary ?? "php",
    timeout: options.timeout ?? 5000,
    bootstrap: options.bootstrap ?? null,
    adapter: options.adapter ?? null,
    defaultMethod: options.defaultMethod ?? null,
    ...(resolvedTypeMap ? { typeMap: resolvedTypeMap } : {}),
    adapterMap: resolveAdapterMap(resolvedFiles),
  };
}

export function resolveImportSource(
  source: string,
  importer: string | undefined,
  options: ResolvedFrameworkOptions,
): ResolvedImportSource | null {
  if (options.typeMap?.files && importer) {
    const sourcePath = stripCallableSuffix(source);
    const absPath = isAbsolute(sourcePath) ? sourcePath : resolve(dirname(importer), sourcePath);
    const mapping = findResolvedFileMapping(absPath, options.typeMap.files);
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
): ResolvedFileMapTarget | null {
  let exactMatch: ResolvedFileMapTarget | undefined;
  let patternMatch: ResolvedFileMapTarget | undefined;
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

  return mergeFileMapTargets(patternMatch, exactMatch);
}

export function resolveAdapterForSourceFile(
  sourceFile: string,
  options: ResolvedFrameworkOptions,
): string | null {
  const mapping = options.typeMap?.files
    ? findResolvedFileMapping(sourceFile, options.typeMap.files)
    : null;
  if (mapping?.adapter) {
    return mapping.adapter;
  }
  return options.adapter;
}

export function mergeStoryTypeMaps(
  base: { bindings?: Record<string, string>; args?: Record<string, unknown> } | null,
  storyTypeMap: StoryTypeMap | null | undefined,
): { bindings?: Record<string, string>; args?: Record<string, unknown> } | null {
  if (!base && !storyTypeMap) return null;
  if (!storyTypeMap) return base;
  if (!base) return storyTypeMap;
  return {
    ...(base.bindings || storyTypeMap.bindings
      ? { bindings: { ...base.bindings, ...storyTypeMap.bindings } }
      : {}),
    ...(base.args || storyTypeMap.args ? { args: { ...base.args, ...storyTypeMap.args } } : {}),
  };
}

function resolveTypeMapFiles(
  fileMap: Record<string, FileMapTarget> | undefined,
  configDir: string,
): ResolvedFileMap | undefined {
  if (!fileMap) return undefined;

  const exact: Record<string, ResolvedFileMapTarget> = {};
  const patterns: Array<{ suffix: string; target: ResolvedFileMapTarget }> = [];

  for (const [key, target] of Object.entries(fileMap)) {
    const resolvedTarget: ResolvedFileMapTarget = {};

    if (target.args !== undefined) resolvedTarget.args = target.args;
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

function mergeFileMapTargets(
  pattern: ResolvedFileMapTarget,
  exact: ResolvedFileMapTarget,
): ResolvedFileMapTarget {
  const result: ResolvedFileMapTarget = {};

  const args = exact.args ?? pattern.args;
  if (args !== undefined) result.args = args;

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
