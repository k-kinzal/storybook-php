import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function environmentId(root) {
  const hash = createHash("sha256");
  for (const file of ["vrt-environment.json", "vrt-config.mjs", "prepare-screenshot.mjs"]) {
    const content = readFileSync(join(root, "examples/_shared", file), "utf8");
    hash
      .update(file)
      .update(file.endsWith(".json") ? JSON.stringify(JSON.parse(content)) : content);
  }
  return hash.digest("hex");
}

export function snapshotFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".png"))
    .map((entry) => join(entry.parentPath, entry.name).slice(directory.length + 1))
    .sort();
}

export function inspectBaseline(directory, expected) {
  const manifestPath = join(directory, "manifest.json");
  if (!existsSync(manifestPath))
    return {
      available: false,
      reason: "Main has not published a baseline for this commit and capture environment.",
    };
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  for (const key of ["schema", "sourceSha", "environment", "example", "php"]) {
    if (manifest[key] !== expected[key]) {
      return { available: false, reason: `Main baseline ${key} does not match this comparison.` };
    }
  }
  const files = snapshotFiles(directory);
  if (!files.length || JSON.stringify(files) !== JSON.stringify(manifest.files)) {
    throw new Error("Main baseline is incomplete; rebuild it from the main workflow.");
  }
  return { available: true, reason: "" };
}

function run() {
  const [command, example, php, sourceSha] = process.argv.slice(2);
  if (
    !/^[a-z0-9-]+$/.test(example ?? "") ||
    !/^8\.[0-5]$/.test(php ?? "") ||
    !/^[a-f0-9]{40}$/.test(sourceSha ?? "")
  ) {
    throw new Error("Usage: baseline.mjs <key|check|publish> <example> <PHP minor> <main SHA>");
  }
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  const directory = join(root, "examples", example, "__vis__/linux/__baselines__");
  const expected = { schema: 1, sourceSha, environment: environmentId(root), example, php };
  if (command === "key") {
    console.log(`key=vrt-v3-${example}-${php}-${expected.environment}-${sourceSha}`);
  } else if (command === "check") {
    const result = inspectBaseline(directory, expected);
    const statusPath = join(root, "examples", example, "__vis__/linux/vrt-status.json");
    mkdirSync(dirname(statusPath), { recursive: true });
    writeFileSync(
      statusPath,
      JSON.stringify({ ...expected, ...result, status: "unavailable" }, null, 2),
    );
    console.log(`available=${result.available}`);
    if (!result.available)
      console.error(`::notice title=VRT baseline unavailable::${example}: ${result.reason}`);
  } else if (command === "publish") {
    if (
      process.env["GITHUB_REF"] !== "refs/heads/main" ||
      !["push", "workflow_dispatch"].includes(process.env["GITHUB_EVENT_NAME"])
    ) {
      throw new Error("Only the main workflow may publish canonical baselines.");
    }
    if (sourceSha !== process.env["GITHUB_SHA"])
      throw new Error("Baseline source must be the checked-out main commit.");
    const files = snapshotFiles(directory);
    if (!files.length) throw new Error("Cannot publish an empty baseline.");
    writeFileSync(
      join(directory, "manifest.json"),
      JSON.stringify({ ...expected, files }, null, 2),
    );
  } else {
    throw new Error(`Unknown baseline command: ${command}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();
