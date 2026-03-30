import { resolveFrameworkOptions } from "../config/framework-config.js";
import {
  listCallableNamesFromMeta,
  resolveComponentSource,
} from "../component/component-source.js";
import { buildSchemasFromMeta, buildTemplateSchema } from "../component/schema-builder.js";
import {
  generateDeclarationOutputsForResolvedSource,
  type DeclarationOutput,
} from "./declaration-files.js";
import { generateDeclarationModule } from "../component/declaration-emitter.js";
import type { FrameworkOptions, PhpFileMeta, TypeMapConfig } from "../../types.js";

/**
 * Legacy helper retained for API compatibility.
 * Prefer `generateDtsOutputsForFile()` when you need exact-import declarations.
 */
export function generateDts(meta: PhpFileMeta): string {
  const callableNames = listCallableNamesFromMeta(meta);
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
            publicArgs: {},
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
  return generateDeclarationOutputsForResolvedSource(resolvedSource, resolvedOptions.defaultMethod);
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
