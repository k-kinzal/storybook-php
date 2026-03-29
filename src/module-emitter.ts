import type { PhpArgMap, PhpComponentSchema } from "./types.js";

export interface RegisteredComponentSchema extends PhpComponentSchema {
  componentId: string;
}

export function generateVirtualModule(
  schemas: RegisteredComponentSchema[],
  errorMessage?: string,
): string {
  if (schemas.length === 0) {
    return `throw new Error(${JSON.stringify(errorMessage ?? "Unknown storybook-php module error")});`;
  }

  return schemas
    .map((schema) => {
      const objectLiteral = componentObjectLiteral(schema);
      if (schema.exportName === "default") {
        return `const component = ${objectLiteral};\nexport default component;\n`;
      }

      return `export const ${schema.exportName} = ${objectLiteral};\n`;
    })
    .join("\n");
}

function componentObjectLiteral(schema: RegisteredComponentSchema): string {
  return `{
  __php: true,
  __id: '${schema.componentId}',
  __type: '${schema.renderPlan.type}',
  __file: ${quoteOrNull(schema.renderPlan.sourceFile)},
  __class: ${quoteOrNull(schema.renderPlan.class)},
  __callable: ${quoteOrNull(schema.renderPlan.callable)},
  __constructorArgs: ${argMapToCode(schema.constructorArgs)},
  __callableArgs: ${argMapToCode(schema.callableArgs)},
  __allArgs: ${argMapToCode(schema.allArgs)},
}`;
}

function argMapToCode(argMap: PhpArgMap): string {
  const entries = Object.entries(argMap);
  if (entries.length === 0) return "{}";

  return `{\n${entries
    .map(([name, arg]) => `    ${name}: { ${argDefToCode(arg)} }`)
    .join(",\n")}\n  }`;
}

function argDefToCode(arg: PhpArgMap[string]): string {
  const typeEscaped = arg.type.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  const parts: string[] = [
    `type: '${typeEscaped}'`,
    `required: ${arg.required}`,
    `position: ${arg.position}`,
    `nullable: ${arg.nullable}`,
  ];

  if (arg.default !== undefined) parts.push(`default: ${JSON.stringify(arg.default)}`);
  if (arg.isVariadic !== undefined) parts.push(`isVariadic: ${arg.isVariadic}`);
  if (arg.isPromoted !== undefined) parts.push(`isPromoted: ${arg.isPromoted}`);
  if (arg.visibility !== undefined) parts.push(`visibility: ${JSON.stringify(arg.visibility)}`);
  if (arg.options !== undefined) parts.push(`options: ${JSON.stringify(arg.options)}`);
  if (arg.elementType !== undefined) parts.push(`elementType: ${JSON.stringify(arg.elementType)}`);
  if (arg.enumType !== undefined) parts.push(`enumType: ${JSON.stringify(arg.enumType)}`);
  if (arg.classType !== undefined) parts.push(`classType: ${JSON.stringify(arg.classType)}`);
  if (arg.unionTypes !== undefined) parts.push(`unionTypes: ${JSON.stringify(arg.unionTypes)}`);

  return parts.join(", ");
}

function quoteOrNull(value: string | null): string {
  if (value === null) return "null";
  return JSON.stringify(value);
}
