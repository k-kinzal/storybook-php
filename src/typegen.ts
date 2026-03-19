import { parsePhpFile } from "./php-parser.js";
import type { PhpFileMeta, PhpParamMeta, PhpClassMeta } from "./types.js";

/**
 * Map a PHP type string to a TypeScript type string.
 */
function phpTypeToTs(phpType: string | null, cls?: PhpClassMeta): string {
  if (!phpType) return "unknown";

  // Handle nullable ?Type
  if (phpType.startsWith("?")) {
    return `${phpTypeToTs(phpType.slice(1), cls)} | null`;
  }

  // Handle union types A|B
  if (phpType.includes("|")) {
    const parts = phpType.split("|").map((p) => p.trim());
    return parts.map((p) => phpTypeToTs(p, cls)).join(" | ");
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

function paramToTsType(param: PhpParamMeta, cls?: PhpClassMeta): string {
  const baseType = phpTypeToTs(param.type, cls);
  if (param.nullable && !param.type?.includes("|") && !param.type?.startsWith("?")) {
    return `${baseType} | null`;
  }
  return baseType;
}

function generateInterfaceForParams(
  interfaceName: string,
  params: PhpParamMeta[],
  cls?: PhpClassMeta,
): string {
  if (params.length === 0) {
    return `interface ${interfaceName} {\n}\n`;
  }

  const lines = params.map((p) => {
    const optional = !p.required ? "?" : "";
    const tsType = paramToTsType(p, cls);
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
        parts.push(generateInterfaceForParams(interfaceName, allParams, cls));
        parts.push(`export declare const ${cls.name}: PhpComponent<${interfaceName}>;\n`);
      }
      continue;
    }

    // Regular class -- generate for each public method
    for (const method of cls.methods) {
      const interfaceName = `${cls.name}_${method.name}_Args`;
      const allParams = [...cls.constructorParams, ...method.params];
      parts.push("");
      parts.push(generateInterfaceForParams(interfaceName, allParams, cls));
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
 */
export function generateDtsForFile(filePath: string): string {
  const meta = parsePhpFile(filePath);
  return generateDts(meta);
}
