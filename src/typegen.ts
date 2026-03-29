import { loadComponentSchemas, listCallableNames } from "./component-schema.js";
import { generateDeclarationModule } from "./declaration-emitter.js";
import { resolveFrameworkOptions } from "./framework-config.js";
import type { FrameworkOptions, PhpFileMeta, PhpParamMeta, TypeMapConfig } from "./types.js";

export interface DeclarationOutput {
  path: string;
  content: string;
  callableName: string | null;
}

/**
 * Legacy helper retained for API compatibility.
 * Prefer `generateDtsOutputsForFile()` when you need exact-import declarations.
 */
export function generateDts(meta: PhpFileMeta): string {
  const parts: string[] = [];

  const hasClassExports = meta.classes.some(
    (cls) => !cls.isTrait && !cls.isInterface && cls.methods.length > 0,
  );
  const hasFunctionExports = meta.functions.length > 0;

  if (hasClassExports || hasFunctionExports || (!hasClassExports && !hasFunctionExports)) {
    parts.push("import type { PhpComponent } from 'storybook-php';\n");
  }

  for (const cls of meta.classes) {
    if (cls.isTrait || cls.isInterface) continue;

    if (cls.isEnum) {
      for (const method of cls.methods) {
        const interfaceName = `${cls.name}_${method.name}_Args`;
        parts.push("");
        parts.push(
          generateInterfaceForParams(interfaceName, [
            {
              name: "_case",
              type: "string",
              nullable: false,
              required: true,
              isVariadic: false,
              isPromoted: false,
              position: 0,
            },
            ...method.params,
          ]),
        );
        parts.push(`export declare const ${cls.name}: PhpComponent<${interfaceName}>;\n`);
      }
      continue;
    }

    for (const method of cls.methods) {
      const interfaceName = `${cls.name}_${method.name}_Args`;
      const params = method.isStatic ? method.params : [...cls.constructorParams, ...method.params];
      parts.push("");
      parts.push(generateInterfaceForParams(interfaceName, params));
      parts.push(`export declare const ${cls.name}: PhpComponent<${interfaceName}>;\n`);
    }
  }

  for (const fn of meta.functions) {
    const interfaceName = `${fn.name}_Args`;
    parts.push("");
    parts.push(generateInterfaceForParams(interfaceName, fn.params));
    parts.push(`export declare const ${fn.name}: PhpComponent<${interfaceName}>;\n`);
  }

  if (!hasClassExports && !hasFunctionExports) {
    parts.push("");
    parts.push("declare const _default: PhpComponent<Record<string, unknown>>;");
    parts.push("export default _default;\n");
  }

  return parts.join("\n");
}

export function generateDtsForFile(
  filePath: string,
  typeMap?: TypeMapConfig,
  configDir?: string,
  defaultMethod?: string,
): string {
  const options: Pick<FrameworkOptions, "typeMap" | "_configDir" | "defaultMethod"> = {};
  if (typeMap !== undefined) options.typeMap = typeMap;
  if (configDir !== undefined) options._configDir = configDir;
  if (defaultMethod !== undefined) options.defaultMethod = defaultMethod;

  const outputs = generateDtsOutputsForFile(filePath, options);

  const bareOutput = outputs.find((output) => output.path === `${filePath}.d.ts`);
  return bareOutput?.content ?? "";
}

export function generateDtsOutputsForFile(
  filePath: string,
  options: Pick<FrameworkOptions, "typeMap" | "_configDir" | "defaultMethod"> = {},
): DeclarationOutput[] {
  const resolvedOptions = resolveFrameworkOptions(options);
  const outputs: DeclarationOutput[] = [];

  const bareSchemas = loadComponentSchemas(
    filePath,
    resolvedOptions.defaultMethod,
    resolvedOptions,
  );
  outputs.push({
    path: `${filePath}.d.ts`,
    content: generateDeclarationModule(bareSchemas.schemas),
    callableName: resolvedOptions.defaultMethod,
  });

  for (const callableName of listCallableNames(filePath, resolvedOptions)) {
    const schemas = loadComponentSchemas(filePath, callableName, resolvedOptions);
    if (schemas.schemas.length === 0) continue;
    outputs.push({
      path: `${filePath}@${callableName}.d.ts`,
      content: generateDeclarationModule(schemas.schemas),
      callableName,
    });
  }

  return dedupeOutputs(outputs);
}

function dedupeOutputs(outputs: DeclarationOutput[]): DeclarationOutput[] {
  const seen = new Map<string, DeclarationOutput>();
  for (const output of outputs) {
    seen.set(output.path, output);
  }
  return [...seen.values()].sort((left, right) => left.path.localeCompare(right.path));
}

function generateInterfaceForParams(interfaceName: string, params: PhpParamMeta[]): string {
  if (params.length === 0) {
    return `interface ${interfaceName} {\n}\n`;
  }

  const lines = params.map((param) => {
    const optional = param.required ? "" : "?";
    return `  ${param.name}${optional}: ${paramToTsType(param)};`;
  });

  return `interface ${interfaceName} {\n${lines.join("\n")}\n}\n`;
}

function paramToTsType(param: PhpParamMeta): string {
  if (!param.type) {
    return param.nullable ? "unknown | null" : "unknown";
  }

  if (param.type.startsWith("?")) {
    return `${phpTypeToTs(param.type.slice(1))} | null`;
  }

  const mapped = phpTypeToTs(param.type);
  if (param.nullable && !mapped.includes("null")) {
    return `${mapped} | null`;
  }
  return mapped;
}

function phpTypeToTs(phpType: string): string {
  if (phpType.includes("|")) {
    return phpType
      .split("|")
      .map((part) => phpTypeToTs(part.trim()))
      .join(" | ");
  }

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
