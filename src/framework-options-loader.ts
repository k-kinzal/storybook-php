import { readFileSync } from "node:fs";
import { extname, isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { FrameworkOptions } from "./types.js";

export async function loadFrameworkOptionsFile(
  optionsFile: string | undefined,
  cwd: string = process.cwd(),
): Promise<Pick<FrameworkOptions, "typeMap" | "_configDir" | "defaultMethod">> {
  if (!optionsFile) {
    return {};
  }

  const resolvedPath = isAbsolute(optionsFile) ? optionsFile : resolve(cwd, optionsFile);
  const extension = extname(resolvedPath).toLowerCase();

  const loaded =
    extension === ".json"
      ? JSON.parse(readFileSync(resolvedPath, "utf-8"))
      : unwrapModuleDefault(await import(pathToFileURL(resolvedPath).href));

  if (typeof loaded !== "object" || loaded === null || Array.isArray(loaded)) {
    throw new Error(`Framework options file must export an object: ${resolvedPath}`);
  }

  return loaded as Pick<FrameworkOptions, "typeMap" | "_configDir" | "defaultMethod">;
}

function unwrapModuleDefault(moduleValue: unknown): unknown {
  if (
    typeof moduleValue === "object" &&
    moduleValue !== null &&
    "default" in moduleValue &&
    (moduleValue as Record<string, unknown>)["default"] !== undefined
  ) {
    return (moduleValue as Record<string, unknown>)["default"];
  }

  return moduleValue;
}
