import { phpTypeToTs } from "../typescript/php-type-to-ts.js";
import type { PhpArgMap, PhpComponentSchema } from "../../types.js";

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
