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
    case "unknown":
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
