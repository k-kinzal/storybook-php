import type ts from "typescript";
import { existsSync, readFileSync, statSync } from "node:fs";
import { generateDeclarationModule } from "../component/declaration-emitter.js";
import { resolveSchemasForSource } from "../component/component-schema.js";
import {
  resolveComponentSource,
  type ResolvedComponentSource,
} from "../component/component-source.js";
import {
  PHP_IMPORT_RE,
  resolveFrameworkOptions,
  resolveImportSource,
  extractCallableName,
  stripCallableSuffix,
} from "../config/framework-config.js";
import { parsePhpSource } from "../analysis/php-parser.js";
import type { FrameworkOptions, PhpFileMeta } from "../types.js";

export interface PhpResolver {
  resolvePhpImport(specifier: string, containingFile: string): string | null;
  isPhpImport(specifier: string): boolean;
  getPhpMeta(filePath: string): PhpFileMeta | null;
  getVirtualDeclarationPath(specifier: string, containingFile: string): string | null;
  getVirtualDeclaration(fileName: string): string | null;
  getVirtualDeclarationVersion(fileName: string): string | null;
}

export interface PhpResolverConfig extends Pick<
  FrameworkOptions,
  "defaultMethod" | "typeMap" | "_configDir"
> {
  configDir?: string;
}

export function createPhpResolver(
  _tsModule: typeof ts,
  config: string | PhpResolverConfig = {},
): PhpResolver {
  const resolvedOptions = resolveFrameworkOptions(normalizeResolverConfig(config));
  const metaCache = new Map<string, { mtime: number; meta: PhpFileMeta }>();
  const declarationCache = new Map<string, { version: string; content: string }>();

  function isPhpImport(specifier: string): boolean {
    return PHP_IMPORT_RE.test(specifier);
  }

  function getPhpMeta(filePath: string): PhpFileMeta | null {
    if (!existsSync(filePath)) return null;

    const mtime = statSync(filePath).mtimeMs;
    const cached = metaCache.get(filePath);
    if (cached && cached.mtime === mtime) return cached.meta;

    try {
      const source = readFileSync(filePath, "utf-8");
      const meta = parsePhpSource(source, filePath);
      metaCache.set(filePath, { mtime, meta });
      return meta;
    } catch {
      return null;
    }
  }

  function resolvePhpImport(specifier: string, containingFile: string): string | null {
    const resolvedImport = resolveImportSource(specifier, containingFile, resolvedOptions);
    if (!resolvedImport) return null;

    try {
      const resolvedSource = resolveComponentSource(resolvedImport.sourceFile, resolvedOptions);
      const schemas = resolveSchemasForSource(resolvedSource, resolvedImport.callableName);
      return schemas.schemas.length > 0 ? generateDeclarationModule(schemas.schemas) : "";
    } catch {
      return null;
    }
  }

  function getVirtualDeclarationPath(specifier: string, containingFile: string): string | null {
    const resolvedImport = resolveImportSource(specifier, containingFile, resolvedOptions);
    if (!resolvedImport) return null;

    const suffix = resolvedImport.callableName ? `@${resolvedImport.callableName}` : "";
    return `${resolvedImport.sourceFile}${suffix}.d.ts`;
  }

  function getVirtualDeclaration(fileName: string): string | null {
    const sourcePath = stripVirtualDeclarationSuffix(fileName);
    if (!sourcePath) return null;

    const explicitCallable = extractCallableName(sourcePath);
    const importPath = stripCallableSuffix(sourcePath);
    const callableName = explicitCallable ?? resolvedOptions.defaultMethod;

    if (!existsSync(importPath)) return null;

    try {
      const resolvedSource = resolveComponentSource(importPath, resolvedOptions);
      const version = versionForResolvedSource(resolvedSource);
      const cached = declarationCache.get(fileName);
      if (cached && cached.version === version) {
        return cached.content;
      }

      const schemas = resolveSchemasForSource(resolvedSource, callableName);
      if (schemas.schemas.length === 0) {
        return null;
      }

      const content = generateDeclarationModule(schemas.schemas);
      declarationCache.set(fileName, { version, content });
      return content;
    } catch {
      return null;
    }
  }

  function getVirtualDeclarationVersion(fileName: string): string | null {
    const sourcePath = stripVirtualDeclarationSuffix(fileName);
    if (!sourcePath) return null;

    const importPath = stripCallableSuffix(sourcePath);
    if (!existsSync(importPath)) return null;

    try {
      return versionForResolvedSource(resolveComponentSource(importPath, resolvedOptions));
    } catch {
      return null;
    }
  }

  return {
    resolvePhpImport,
    isPhpImport,
    getPhpMeta,
    getVirtualDeclarationPath,
    getVirtualDeclaration,
    getVirtualDeclarationVersion,
  };
}

function stripVirtualDeclarationSuffix(fileName: string): string | null {
  if (!fileName.endsWith(".d.ts")) return null;
  return fileName.slice(0, -".d.ts".length);
}

function normalizeResolverConfig(config: string | PhpResolverConfig): PhpResolverConfig {
  if (typeof config === "string") {
    return { defaultMethod: config };
  }

  const normalized: PhpResolverConfig = {
    ...config,
  };

  const configDir = config._configDir ?? config.configDir;
  if (configDir !== undefined) {
    normalized._configDir = configDir;
  }

  return normalized;
}

function versionForResolvedSource(resolvedSource: ResolvedComponentSource): string {
  return resolvedSource.dependencies
    .map(
      (dependency) => `${dependency}:${existsSync(dependency) ? statSync(dependency).mtimeMs : -1}`,
    )
    .join("|");
}
