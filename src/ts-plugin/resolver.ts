import type ts from "typescript";
import { parsePhpSource } from "../php-parser.js";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import type { PhpFileMeta } from "../types.js";

export interface PhpResolver {
  /** Resolve a .php or .php@method import specifier to virtual type declarations */
  resolvePhpImport(specifier: string, containingFile: string): string | null;
  /** Check if a specifier is a PHP import */
  isPhpImport(specifier: string): boolean;
  /** Get the parsed metadata for a PHP file */
  getPhpMeta(filePath: string): PhpFileMeta | null;
}

const PHP_IMPORT_RE = /\.php(?:@(\w+))?$/;

export function createPhpResolver(_tsModule: typeof ts, defaultMethod?: string): PhpResolver {
  const metaCache = new Map<string, { mtime: number; meta: PhpFileMeta }>();

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
    const match = specifier.match(PHP_IMPORT_RE);
    if (!match) return null;

    const callableName = match[1] ?? defaultMethod ?? null;
    const phpRelPath = specifier.replace(/@\w+$/, "");
    const phpAbsPath = resolve(dirname(containingFile), phpRelPath);

    const meta = getPhpMeta(phpAbsPath);
    if (!meta) return null;

    return generateVirtualDeclaration(meta, callableName);
  }

  return { resolvePhpImport, isPhpImport, getPhpMeta };
}

function generateVirtualDeclaration(meta: PhpFileMeta, callableName: string | null): string {
  const lines: string[] = ["import type { PhpComponent } from 'storybook-php';", ""];

  if (!callableName) {
    // Template mode
    lines.push("declare const _default: PhpComponent<Record<string, unknown>>;");
    lines.push("export default _default;");
    return lines.join("\n");
  }

  // Search in classes/enums
  for (const cls of meta.classes) {
    if (cls.isEnum) {
      const method = cls.methods.find((m) => m.name === callableName);
      if (method) {
        const ifaceName = `${cls.name}_${callableName}_Args`;
        lines.push(`interface ${ifaceName} {`);
        lines.push("  _case: string;");
        for (const p of method.params) {
          const opt = p.required ? "" : "?";
          lines.push(`  ${p.name}${opt}: ${phpTypeToTs(p.type, p.nullable)};`);
        }
        lines.push("}");
        lines.push("");
        lines.push(`export declare const ${cls.name}: PhpComponent<${ifaceName}>;`);
        return lines.join("\n");
      }
      continue;
    }

    const method = cls.methods.find((m) => m.name === callableName);
    if (method) {
      const ifaceName = `${cls.name}_${callableName}_Args`;
      lines.push(`interface ${ifaceName} {`);

      // Constructor params (if instance method)
      if (!method.isStatic) {
        for (const p of cls.constructorParams) {
          const opt = p.required ? "" : "?";
          lines.push(`  ${p.name}${opt}: ${phpTypeToTs(p.type, p.nullable)};`);
        }
      }

      // Method params
      for (const p of method.params) {
        const opt = p.required ? "" : "?";
        lines.push(`  ${p.name}${opt}: ${phpTypeToTs(p.type, p.nullable)};`);
      }

      lines.push("}");
      lines.push("");
      lines.push(`export declare const ${cls.name}: PhpComponent<${ifaceName}>;`);
      return lines.join("\n");
    }
  }

  // Search in functions
  for (const fn of meta.functions) {
    if (fn.name === callableName) {
      const ifaceName = `${fn.name}_Args`;
      lines.push(`interface ${ifaceName} {`);
      for (const p of fn.params) {
        const opt = p.required ? "" : "?";
        lines.push(`  ${p.name}${opt}: ${phpTypeToTs(p.type, p.nullable)};`);
      }
      lines.push("}");
      lines.push("");
      lines.push(`export declare const ${fn.name}: PhpComponent<${ifaceName}>;`);
      return lines.join("\n");
    }
  }

  return "";
}

function phpTypeToTs(phpType: string | null, nullable: boolean): string {
  if (!phpType) return "unknown";

  let tsType: string;

  if (phpType.startsWith("?")) {
    return `${phpTypeToTs(phpType.slice(1), false)} | null`;
  }

  if (phpType.includes("|")) {
    tsType = phpType
      .split("|")
      .map((t) => mapSingleType(t.trim()))
      .join(" | ");
  } else {
    tsType = mapSingleType(phpType);
  }

  if (nullable && !tsType.includes("null")) {
    tsType += " | null";
  }

  return tsType;
}

function mapSingleType(t: string): string {
  switch (t.toLowerCase()) {
    case "string":
      return "string";
    case "int":
    case "integer":
    case "float":
    case "double":
      return "number";
    case "bool":
    case "boolean":
      return "boolean";
    case "array":
      return "unknown[]";
    case "object":
    case "mixed":
      return "unknown";
    case "void":
      return "void";
    case "null":
      return "null";
    case "true":
      return "true";
    case "false":
      return "false";
    case "self":
    case "static":
    case "parent":
      return "Record<string, unknown>";
    default:
      return "Record<string, unknown>";
  }
}
