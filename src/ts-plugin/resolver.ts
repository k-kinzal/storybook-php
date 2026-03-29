import type ts from "typescript";
import { existsSync, readFileSync, statSync } from "node:fs";
import { generateDeclarationModule } from "../declaration-emitter.js";
import {
  PHP_IMPORT_RE,
  resolveFrameworkOptions,
  resolveImportSource,
  extractCallableName,
  stripCallableSuffix,
} from "../framework-config.js";
import { loadComponentSchemas } from "../component-schema.js";
import { parsePhpSource } from "../php-parser.js";
import type { PhpFileMeta } from "../types.js";

export interface PhpResolver {
  resolvePhpImport(specifier: string, containingFile: string): string | null;
  isPhpImport(specifier: string): boolean;
  getPhpMeta(filePath: string): PhpFileMeta | null;
  getVirtualDeclarationPath(specifier: string, containingFile: string): string | null;
  getVirtualDeclaration(fileName: string): string | null;
  getVirtualDeclarationVersion(fileName: string): string | null;
}

export function createPhpResolver(_tsModule: typeof ts, defaultMethod?: string): PhpResolver {
  const resolvedOptions = resolveFrameworkOptions(defaultMethod ? { defaultMethod } : {});
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
      const schemas = loadComponentSchemas(
        resolvedImport.sourceFile,
        resolvedImport.callableName,
        resolvedOptions,
      );
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

    const version = String(statSync(importPath).mtimeMs);
    const cached = declarationCache.get(fileName);
    if (cached && cached.version === version) {
      return cached.content;
    }

    try {
      const schemas = loadComponentSchemas(importPath, callableName, resolvedOptions);
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

    return String(statSync(importPath).mtimeMs);
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
