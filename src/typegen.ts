import { resolve, isAbsolute } from "node:path";
import { parsePhpFile } from "./php-parser.js";
import type { PhpFileMeta, PhpParamMeta, TypeMapConfig, ArgOverride } from "./types.js";

/**
 * Map a PHP type string to a TypeScript type string.
 */
function phpTypeToTs(phpType: string | null): string {
  if (!phpType) return "unknown";

  // Handle nullable ?Type
  if (phpType.startsWith("?")) {
    return `${phpTypeToTs(phpType.slice(1))} | null`;
  }

  // Handle union types A|B
  if (phpType.includes("|")) {
    const parts = phpType.split("|").map((p) => p.trim());
    return parts.map((p) => phpTypeToTs(p)).join(" | ");
  }

  // Primitive mapping
  switch (phpType.toLowerCase()) {
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
    case "self":
    case "static":
      return "Record<string, unknown>";
    default:
      // Could be a class type or enum type -- map to Record<string, unknown>
      return "Record<string, unknown>";
  }
}

function paramToTsType(param: PhpParamMeta): string {
  const baseType = phpTypeToTs(param.type);
  if (param.nullable && !param.type?.includes("|") && !param.type?.startsWith("?")) {
    return `${baseType} | null`;
  }
  return baseType;
}

function generateInterfaceForParams(interfaceName: string, params: PhpParamMeta[]): string {
  if (params.length === 0) {
    return `interface ${interfaceName} {\n}\n`;
  }

  const lines = params.map((p) => {
    const optional = !p.required ? "?" : "";
    const tsType = paramToTsType(p);
    return `  ${p.name}${optional}: ${tsType};`;
  });

  return `interface ${interfaceName} {\n${lines.join("\n")}\n}\n`;
}

/**
 * Generate TypeScript declaration (.d.ts) content for a parsed PHP file.
 */
export function generateDts(meta: PhpFileMeta): string {
  const parts: string[] = [];
  let needsImport = false;

  // Check if we will generate any exports
  const hasClassExports = meta.classes.some((cls) => {
    if (cls.isEnum) {
      return cls.methods.length > 0;
    }
    return cls.methods.length > 0;
  });
  const hasFunctionExports = meta.functions.length > 0;
  const isTemplate = !hasClassExports && !hasFunctionExports;

  if (hasClassExports || hasFunctionExports || isTemplate) {
    needsImport = true;
  }

  if (needsImport) {
    parts.push("import type { PhpComponent } from 'storybook-php';\n");
  }

  // Generate for each class
  for (const cls of meta.classes) {
    if (cls.isEnum) {
      // Only generate for enums that have methods
      for (const method of cls.methods) {
        const interfaceName = `${cls.name}_${method.name}_Args`;
        const caseParam: PhpParamMeta = {
          name: "_case",
          type: "string",
          nullable: false,
          required: true,
          isVariadic: false,
          isPromoted: false,
          position: 0,
        };
        // Merge _case param with method params
        const allParams = [caseParam, ...method.params];
        parts.push("");
        parts.push(generateInterfaceForParams(interfaceName, allParams));
        parts.push(`export declare const ${cls.name}: PhpComponent<${interfaceName}>;\n`);
      }
      continue;
    }

    // Regular class -- generate for each public method
    for (const method of cls.methods) {
      const interfaceName = `${cls.name}_${method.name}_Args`;
      const allParams = [...cls.constructorParams, ...method.params];
      parts.push("");
      parts.push(generateInterfaceForParams(interfaceName, allParams));
      parts.push(`export declare const ${cls.name}: PhpComponent<${interfaceName}>;\n`);
    }
  }

  // Generate for standalone functions
  for (const fn of meta.functions) {
    const interfaceName = `${fn.name}_Args`;
    parts.push("");
    parts.push(generateInterfaceForParams(interfaceName, fn.params));
    parts.push(`export declare const ${fn.name}: PhpComponent<${interfaceName}>;\n`);
  }

  // If no classes or functions, generate template default export
  if (!hasClassExports && !hasFunctionExports) {
    parts.push("");
    parts.push("declare const _default: PhpComponent<Record<string, unknown>>;");
    parts.push("export default _default;\n");
  }

  return parts.join("\n");
}

/**
 * Generate TypeScript declaration (.d.ts) content for a PHP file path.
 * Supports typeMap for files that need external type sources.
 */
export function generateDtsForFile(
  filePath: string,
  typeMap?: TypeMapConfig,
  configDir?: string,
): string {
  const baseDir = configDir ?? process.cwd();

  // Check if this file has a typeMap.files mapping
  if (typeMap?.files) {
    for (const [pattern, target] of Object.entries(typeMap.files)) {
      const resolvedPattern = isAbsolute(pattern) ? pattern : resolve(baseDir, pattern);
      if (filePath !== resolvedPattern) continue;

      // Inline args: generate interface from the mapping directly
      if (target.args) {
        return generateDtsForInlineArgs(target.args);
      }

      // phpFile redirect: parse that file instead
      if (target.phpFile) {
        const phpFilePath = isAbsolute(target.phpFile)
          ? target.phpFile
          : resolve(baseDir, target.phpFile);
        const meta = parsePhpFile(phpFilePath);
        return generateDts(meta);
      }
    }
  }

  const meta = parsePhpFile(filePath);
  return generateDts(meta);
}

/**
 * Generate .d.ts content for inline args defined in typeMap.files[].args.
 */
function generateDtsForInlineArgs(args: Record<string, string | ArgOverride>): string {
  const parts: string[] = [];
  parts.push("import type { PhpComponent } from 'storybook-php';\n");

  const params: PhpParamMeta[] = Object.entries(args).map(([name, def], position) => {
    if (typeof def === "string") {
      const nullable = def.startsWith("?");
      const type = nullable ? def.slice(1) : def;
      return {
        name,
        type,
        nullable,
        required: !nullable,
        isVariadic: false,
        isPromoted: false,
        position,
      };
    }
    return {
      name,
      type: def.type ?? "unknown",
      nullable: def.nullable ?? false,
      required: def.required ?? (def.default === undefined && !(def.nullable ?? false)),
      default: stringifyInlineDefault(def.default),
      isVariadic: false,
      isPromoted: false,
      position,
    };
  });

  const interfaceName = "_default_Args";
  parts.push("");
  parts.push(generateInterfaceForParams(interfaceName, params));
  parts.push("declare const _default: PhpComponent<_default_Args>;");
  parts.push("export default _default;\n");

  return parts.join("\n");
}

function stringifyInlineDefault(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  if (value === null) return "null";
  return JSON.stringify(value);
}
