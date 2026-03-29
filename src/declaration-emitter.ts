import type { PhpArgMap, PhpComponentSchema } from "./types.js";

export function generateDeclarationModule(schemas: PhpComponentSchema[]): string {
  const parts: string[] = ["import type { PhpComponent } from 'storybook-php';", ""];

  for (const schema of schemas) {
    const declaration = declarationForSchema(schema);
    if (declaration.interfaceBody) {
      parts.push(declaration.interfaceBody);
    }
    if (schema.exportName === "default") {
      parts.push(`declare const _default: PhpComponent<${declaration.typeRef}>;`);
      parts.push("export default _default;");
    } else {
      parts.push(
        `export declare const ${schema.exportName}: PhpComponent<${declaration.typeRef}>;`,
      );
    }
    parts.push("");
  }

  return parts.join("\n").trimEnd() + "\n";
}

export function phpTypeToTs(
  phpType: string | null,
  nullable = false,
  elementType?: string,
): string {
  if (elementType) {
    return `${phpTypeToTs(elementType)}[]${nullable ? " | null" : ""}`;
  }

  if (!phpType) return nullable ? "unknown | null" : "unknown";

  if (phpType.startsWith("?")) {
    return `${phpTypeToTs(phpType.slice(1))} | null`;
  }

  if (phpType.includes("|")) {
    const union = phpType
      .split("|")
      .map((part) => mapSingleType(part.trim()))
      .join(" | ");
    return nullable && !union.includes("null") ? `${union} | null` : union;
  }

  const mapped = mapSingleType(phpType);
  return nullable && !mapped.includes("null") ? `${mapped} | null` : mapped;
}

function generateInterfaceForArgMap(interfaceName: string, argMap: PhpArgMap): string {
  const entries = Object.entries(argMap);
  if (entries.length === 0) {
    return `interface ${interfaceName} {\n}`;
  }

  return `interface ${interfaceName} {\n${entries
    .map(([name, arg]) => {
      const optional = arg.required ? "" : "?";
      return `  ${name}${optional}: ${phpTypeToTs(arg.type, arg.nullable, arg.elementType)};`;
    })
    .join("\n")}\n}`;
}

function declarationForSchema(schema: PhpComponentSchema): {
  typeRef: string;
  interfaceBody: string | null;
} {
  if (schema.exportName === "default" && Object.keys(schema.allArgs).length === 0) {
    return {
      typeRef: "Record<string, unknown>",
      interfaceBody: null,
    };
  }

  const interfaceName = interfaceNameForSchema(schema);
  return {
    typeRef: interfaceName,
    interfaceBody: generateInterfaceForArgMap(interfaceName, schema.allArgs),
  };
}

function interfaceNameForSchema(schema: PhpComponentSchema): string {
  const baseName = schema.exportName === "default" ? "_default" : schema.exportName;
  const safeBase = baseName.replace(/[^\w]+/g, "_");

  if (schema.renderPlan.type === "function") {
    return `${safeBase}_Args`;
  }

  if (schema.exportName === "default") {
    return `${safeBase}_Args`;
  }

  const callableName = schema.renderPlan.callable ?? "template";
  const safeCallable = callableName
    .replace(/^.*\\/, "")
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return `${safeBase}_${safeCallable || "template"}_Args`;
}

function mapSingleType(type: string): string {
  switch (type.toLowerCase()) {
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
