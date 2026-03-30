import { readFileSync } from "node:fs";
import type { PhpFileMeta } from "../../types.js";
import { extractClasses, extractStandaloneFunctions } from "./php-parser/extractors.js";
import { preprocess } from "./php-parser/preprocess.js";
import { extractNamespaceScopes, extractPrimaryNamespace } from "./php-parser/scopes.js";

export function parsePhpFile(filePath: string): PhpFileMeta {
  const source = readFileSync(filePath, "utf-8");
  return parsePhpSource(source, filePath);
}

export function parsePhpSource(source: string, filePath: string): PhpFileMeta {
  const cleaned = preprocess(source);
  const scopes = extractNamespaceScopes(cleaned);

  return {
    filePath,
    namespace: extractPrimaryNamespace(scopes),
    classes: scopes.flatMap((scope) => extractClasses(scope.body, scope.namespace)),
    functions: scopes.flatMap((scope) => extractStandaloneFunctions(scope.body, scope.namespace)),
  };
}
