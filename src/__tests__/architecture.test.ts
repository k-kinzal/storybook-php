import { describe, it, expect } from "vite-plus/test";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";

type SourceLayer = "contracts" | "shared" | "core" | "runtime" | "entrypoints" | "ignored";

const allowedImports: Record<Exclude<SourceLayer, "ignored">, SourceLayer[]> = {
  contracts: ["contracts"],
  shared: ["contracts", "shared"],
  core: ["contracts", "shared", "core"],
  runtime: ["contracts", "shared", "core", "runtime"],
  entrypoints: ["contracts", "shared", "core", "runtime", "entrypoints"],
};

describe("source layering", () => {
  it("keeps only package entrypoints and shared contracts at the src root", () => {
    const srcRoot = resolve(__dirname, "..");
    const rootFiles = readdirSync(srcRoot, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
      .map((entry) => entry.name)
      .sort();

    expect(rootFiles).toEqual([
      "cli.ts",
      "index.ts",
      "preset.ts",
      "preview.ts",
      "public-types.ts",
      "types.ts",
      "vite-plugin.ts",
    ]);
  });

  it("keeps only the expected internal layers directly under src", () => {
    const srcRoot = resolve(__dirname, "..");
    const rootDirs = readdirSync(srcRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    expect(rootDirs).toEqual(["__tests__", "cli", "core", "php", "runtime", "shared", "ts-plugin"]);
  });

  it("enforces one-way imports between contracts, shared, core, runtime, and entrypoints", () => {
    const srcRoot = resolve(__dirname, "..");

    for (const filePath of listSourceFiles(srcRoot)) {
      const sourceLayer = getSourceLayer(filePath, srcRoot);
      if (sourceLayer === "ignored") continue;

      for (const specifier of collectRelativeImports(filePath)) {
        const resolvedImport = resolveRelativeImport(filePath, specifier);
        const targetLayer = getSourceLayer(resolvedImport, srcRoot);
        if (targetLayer === "ignored") continue;

        expect(
          allowedImports[sourceLayer],
          `${relative(srcRoot, filePath)} must not import ${relative(srcRoot, resolvedImport)}`,
        ).toContain(targetLayer);
      }
    }
  });
});

function listSourceFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const target = resolve(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...listSourceFiles(target));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(target);
    }
  }

  return files;
}

function collectRelativeImports(filePath: string): string[] {
  const source = readFileSync(filePath, "utf-8");
  const specifiers = new Set<string>();
  const patterns = [/from\s+"(\.[^"]+)"/g, /import\("(\.[^"]+)"\)/g];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      specifiers.add(match[1]!);
    }
  }

  return [...specifiers];
}

function resolveRelativeImport(filePath: string, specifier: string): string {
  return resolve(dirname(filePath), specifier.replace(/\.js$/, ".ts"));
}

function getSourceLayer(filePath: string, srcRoot: string): SourceLayer {
  const relPath = relative(srcRoot, filePath);
  const [firstSegment] = relPath.split("/");

  if (firstSegment === "__tests__" || firstSegment === "php") {
    return "ignored";
  }

  if (relPath === "types.ts" || relPath === "public-types.ts") {
    return "contracts";
  }

  if (firstSegment === "shared") {
    return "shared";
  }

  if (firstSegment === "core") {
    return "core";
  }

  if (firstSegment === "runtime") {
    return "runtime";
  }

  return "entrypoints";
}
