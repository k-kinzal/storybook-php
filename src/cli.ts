#!/usr/bin/env node
import { resolve, relative, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import {
  symlinkSync,
  unlinkSync,
  lstatSync,
  existsSync,
  writeFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { generateDtsForFile } from "./typegen.js";

const [, , command, ...args] = process.argv;

switch (command) {
  case "start":
    runStorybook("dev", args);
    break;
  case "build":
    runStorybook("build", args);
    break;
  case "test":
    runTest(args);
    break;
  case "typegen":
    runTypegen(args);
    break;
  default:
    printUsage();
    process.exit(command ? 1 : 0);
}

function ensureNodeModulesLink(): (() => void) | null {
  const localNodeModules = resolve("node_modules");

  // Already has node_modules — don't touch it
  if (existsSync(localNodeModules)) {
    return null;
  }

  // This package lives at <node_modules>/storybook-php/dist/cli.mjs
  // so parent node_modules = two levels up from package root
  const __filename = fileURLToPath(import.meta.url);
  const packageRoot = resolve(dirname(__filename), "..");
  const parentNodeModules = dirname(packageRoot);

  symlinkSync(parentNodeModules, localNodeModules, "junction");

  return () => {
    try {
      if (existsSync(localNodeModules) && lstatSync(localNodeModules).isSymbolicLink()) {
        unlinkSync(localNodeModules);
      }
    } catch {
      // best-effort cleanup
    }
  };
}

function withCleanup(cleanup: (() => void) | null, child: ReturnType<typeof spawn>): void {
  const exit = (code: number | null) => {
    cleanup?.();
    process.exit(code ?? 1);
  };

  for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
    process.on(sig, () => {
      cleanup?.();
      child.kill(sig);
    });
  }
  child.on("close", exit);
}

function runStorybook(cmd: string, cliArgs: string[]): void {
  const require = createRequire(import.meta.url);
  const storybookBin = require.resolve("storybook/internal/bin/dispatcher");

  const cleanup = ensureNodeModulesLink();

  const child = spawn(process.execPath, [storybookBin, cmd, ...cliArgs], {
    stdio: "inherit",
  });

  withCleanup(cleanup, child);
}

function resolvePackageBin(pkg: string, bin: string): string {
  const bases = [
    import.meta.url,
    pathToFileURL(resolve(process.cwd(), "_resolve.js")).href,
  ];
  for (const base of bases) {
    try {
      const pkgJson = createRequire(base).resolve(`${pkg}/package.json`);
      return resolve(dirname(pkgJson), bin);
    } catch {
      // continue
    }
  }
  throw new Error(`${pkg} not found. Install it in your project:\n\n  npm install -D ${pkg}\n`);
}

function runTest(cliArgs: string[]): void {
  let vitestBin: string;
  try {
    vitestBin = resolvePackageBin("vitest", "vitest.mjs");
  } catch {
    console.error(
      [
        "vitest not found. Install test dependencies or use --package:",
        "",
        "  npx --package=vitest --package=@storybook/addon-vitest \\",
        "      --package=@vitest/browser-playwright \\",
        "      storybook-php test",
        "",
      ].join("\n"),
    );
    process.exit(1);
  }

  // Use bundled vitest config if user has none and --config is not specified
  const configArgs: string[] = [];
  if (!hasUserConfig() && !cliArgs.some((a) => a === "--config" || a === "-c" || a.startsWith("--config="))) {
    const __filename = fileURLToPath(import.meta.url);
    const defaultConfig = resolve(dirname(__filename), "..", "templates", "vitest.config.mjs");
    configArgs.push("--config", defaultConfig, "--root", process.cwd());
  }

  const cleanup = ensureNodeModulesLink();

  const child = spawn(process.execPath, [vitestBin, "run", ...configArgs, ...cliArgs], {
    stdio: "inherit",
  });

  withCleanup(cleanup, child);
}

function hasUserConfig(): boolean {
  const bases = ["vitest.config", "vitest.workspace"];
  const exts = [".ts", ".mts", ".cts", ".js", ".mjs", ".cjs"];
  return bases.some((base) => exts.some((ext) => existsSync(resolve(base + ext))));
}

function runTypegen(dirs: string[]): void {
  const targetDirs = dirs.length > 0 ? dirs : ["src"];
  let count = 0;

  for (const dir of targetDirs) {
    const absDir = resolve(dir);
    walkPhpFiles(absDir, (phpPath) => {
      const dts = generateDtsForFile(phpPath);
      if (dts.trim()) {
        const dtsPath = phpPath + ".d.ts";
        writeFileSync(dtsPath, dts);
        console.log(`  ${relative(process.cwd(), dtsPath)}`);
        count++;
      }
    });
  }

  console.log(`\nGenerated ${count} .d.ts files.`);
}

function printUsage(): void {
  console.log(
    [
      "Usage: storybook-php <command> [options]",
      "",
      "Commands:",
      "  start [opts]      Start Storybook dev server",
      "  build [opts]      Build static Storybook",
      "  test [opts]       Run Storybook tests",
      "  typegen [dirs...] Generate .d.ts files for PHP sources",
    ].join("\n"),
  );
}

function walkPhpFiles(dir: string, cb: (path: string) => void): void {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory() && entry !== "node_modules" && entry !== "vendor") {
      walkPhpFiles(full, cb);
    } else if (entry.endsWith(".php")) {
      cb(full);
    }
  }
}
