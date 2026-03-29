import { resolveFrameworkOptions } from "../config/framework-config.js";
import { generateDeclarationModule } from "../component/declaration-emitter.js";
import { resolveSchemasForSource } from "../component/component-schema.js";
import {
  listCallableNamesFromResolvedSource,
  resolveComponentSource,
} from "../component/component-source.js";
import { buildSchemasFromMeta, buildTemplateSchema } from "../component/schema-builder.js";
import type { FrameworkOptions, PhpFileMeta, TypeMapConfig } from "../types.js";

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
  const callableNames = collectCallableNames(meta);
  const schemas =
    callableNames.length > 0
      ? callableNames.flatMap((callableName) =>
          buildSchemasFromMeta(meta, callableName, {
            sourceFile: meta.filePath,
            executionFile: meta.filePath,
            adapter: null,
          }),
        )
      : [
          buildTemplateSchema({
            sourceFile: meta.filePath,
            executionFile: meta.filePath,
            allArgs: {},
            adapter: null,
          }),
        ];

  // `generateDts()` predates exact-import declaration outputs.
  // Keep it as a compatibility shim, but funnel the final text through the
  // same declaration emitter used by the real typegen path.
  return generateDeclarationModule(dedupeSchemas(schemas));
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
  const resolvedSource = resolveComponentSource(filePath, resolvedOptions);
  const outputs: DeclarationOutput[] = [];
  const bareSchemas = resolveSchemasForSource(resolvedSource, resolvedOptions.defaultMethod);
  outputs.push({
    path: `${filePath}.d.ts`,
    content: generateDeclarationModule(bareSchemas.schemas),
    callableName: bareSchemas.schemas[0]?.renderPlan.callable ?? resolvedOptions.defaultMethod,
  });

  for (const callableName of listCallableNamesFromResolvedSource(resolvedSource)) {
    const schemas = resolveSchemasForSource(resolvedSource, callableName);
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

function collectCallableNames(meta: PhpFileMeta): string[] {
  const callableNames = new Set<string>();

  for (const fn of meta.functions) {
    callableNames.add(fn.name);
  }

  for (const cls of meta.classes) {
    if (cls.isTrait || cls.isInterface) continue;
    for (const method of cls.methods) {
      callableNames.add(method.name);
    }
  }

  return [...callableNames].sort();
}

function dedupeSchemas(
  schemas: ReturnType<typeof buildSchemasFromMeta>,
): ReturnType<typeof buildSchemasFromMeta> {
  const seen = new Set<string>();
  return schemas.filter((schema) => {
    const key = [
      schema.exportName,
      schema.renderPlan.type,
      schema.renderPlan.class ?? "",
      schema.renderPlan.callable ?? "",
    ].join(":");
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
