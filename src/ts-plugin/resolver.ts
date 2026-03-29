import type ts from "typescript";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolveComponentSource } from "../core/component/component-source.js";
import {
  PHP_IMPORT_RE,
  resolveFrameworkOptions,
  resolveImportSource,
  extractCallableName,
  stripCallableSuffix,
} from "../core/config/framework-config.js";
import {
  declarationPathForImport,
  generateDeclarationContentForImport,
  versionForResolvedSource,
} from "../core/typescript/declaration-files.js";
import { parsePhpSource } from "../core/analysis/php-parser.js";
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

  function resolveImportTarget(
    specifier: string,
    containingFile: string,
  ): {
    explicitCallable: string | null;
    sourceFile: string;
  } | null {
    const explicitCallable = extractCallableName(specifier);
    const resolvedImport = resolveImportSource(specifier, containingFile, resolvedOptions);
    if (!resolvedImport) {
      return null;
    }

    return {
      explicitCallable,
      sourceFile: resolvedImport.sourceFile,
    };
  }

  function resolveVirtualDeclarationTarget(fileName: string): {
    explicitCallable: string | null;
    importPath: string;
  } | null {
    const sourcePath = stripVirtualDeclarationSuffix(fileName);
    if (!sourcePath) {
      return null;
    }

    const explicitCallable = extractCallableName(sourcePath);
    const importPath = stripCallableSuffix(sourcePath);
    if (!existsSync(importPath)) {
      return null;
    }

    return {
      explicitCallable,
      importPath,
    };
  }

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
    const resolvedTarget = resolveImportTarget(specifier, containingFile);
    if (!resolvedTarget) return null;

    try {
      const resolvedSource = resolveComponentSource(resolvedTarget.sourceFile, resolvedOptions);
      return generateDeclarationContentForImport(
        resolvedSource,
        resolvedTarget.explicitCallable,
        resolvedOptions.defaultMethod,
      );
    } catch {
      return null;
    }
  }

  function getVirtualDeclarationPath(specifier: string, containingFile: string): string | null {
    const resolvedTarget = resolveImportTarget(specifier, containingFile);
    if (!resolvedTarget) return null;

    return declarationPathForImport(resolvedTarget.sourceFile, resolvedTarget.explicitCallable);
  }

  function getVirtualDeclaration(fileName: string): string | null {
    const resolvedTarget = resolveVirtualDeclarationTarget(fileName);
    if (!resolvedTarget) return null;

    try {
      const resolvedSource = resolveComponentSource(resolvedTarget.importPath, resolvedOptions);
      const version = versionForResolvedSource(resolvedSource);
      const cached = declarationCache.get(fileName);
      if (cached && cached.version === version) {
        return cached.content;
      }

      const content = generateDeclarationContentForImport(
        resolvedSource,
        resolvedTarget.explicitCallable,
        resolvedOptions.defaultMethod,
      );
      if (content === "") {
        return null;
      }

      declarationCache.set(fileName, { version, content });
      return content;
    } catch {
      return null;
    }
  }

  function getVirtualDeclarationVersion(fileName: string): string | null {
    const resolvedTarget = resolveVirtualDeclarationTarget(fileName);
    if (!resolvedTarget) return null;

    try {
      return versionForResolvedSource(
        resolveComponentSource(resolvedTarget.importPath, resolvedOptions),
      );
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
