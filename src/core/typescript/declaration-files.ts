import { existsSync, statSync } from "node:fs";
import { generateDeclarationModule } from "../component/declaration-emitter.js";
import {
  isMissingRequestedCallable,
  resolveSchemasForSource,
} from "../component/component-schema.js";
import {
  listCallableNamesFromResolvedSource,
  type ResolvedComponentSource,
} from "../component/component-source.js";

export interface DeclarationOutput {
  path: string;
  content: string;
  callableName: string | null;
}

export function declarationPathForImport(
  sourceFile: string,
  explicitCallableName: string | null,
): string {
  return `${sourceFile}${explicitCallableName ? `@${explicitCallableName}` : ""}.d.ts`;
}

export function generateDeclarationContentForImport(
  resolvedSource: ResolvedComponentSource,
  explicitCallableName: string | null,
  defaultCallable: string | null,
): string {
  const requestedCallable = explicitCallableName ?? defaultCallable;
  const result = resolveSchemasForSource(resolvedSource, requestedCallable);

  if (isMissingRequestedCallable(result)) {
    return "";
  }

  return generateDeclarationModule(result.schemas);
}

export function generateDeclarationOutputsForResolvedSource(
  resolvedSource: ResolvedComponentSource,
  defaultCallable: string | null,
): DeclarationOutput[] {
  const outputs: DeclarationOutput[] = [];
  const bareSchemas = resolveSchemasForSource(resolvedSource, defaultCallable);

  if (!isMissingRequestedCallable(bareSchemas)) {
    outputs.push({
      path: declarationPathForImport(resolvedSource.sourceFile, null),
      content: generateDeclarationModule(bareSchemas.schemas),
      callableName: bareSchemas.schemas[0]?.renderPlan.callable ?? defaultCallable,
    });
  }

  for (const callableName of listCallableNamesFromResolvedSource(resolvedSource)) {
    const schemas = resolveSchemasForSource(resolvedSource, callableName);
    if (isMissingRequestedCallable(schemas)) continue;

    outputs.push({
      path: declarationPathForImport(resolvedSource.sourceFile, callableName),
      content: generateDeclarationModule(schemas.schemas),
      callableName,
    });
  }

  return dedupeOutputs(outputs);
}

export function versionForResolvedSource(resolvedSource: ResolvedComponentSource): string {
  return resolvedSource.dependencies
    .map(
      (dependency) => `${dependency}:${existsSync(dependency) ? statSync(dependency).mtimeMs : -1}`,
    )
    .join("|");
}

function dedupeOutputs(outputs: DeclarationOutput[]): DeclarationOutput[] {
  const seen = new Map<string, DeclarationOutput>();

  for (const output of outputs) {
    seen.set(output.path, output);
  }

  return [...seen.values()].sort((left, right) => left.path.localeCompare(right.path));
}
