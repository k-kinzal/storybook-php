import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { snapshotFiles } from "./baseline.mjs";

const [directoryArg, exitCode] = process.argv.slice(2);
const directory = resolve(directoryArg);
const statusPath = resolve(directory, "vrt-status.json");
const initial = existsSync(statusPath)
  ? JSON.parse(readFileSync(statusPath, "utf8"))
  : { available: false, reason: "VRT stopped before checking the main baseline." };
const diffs = snapshotFiles(resolve(directory, "__diffs__")).length;
const status =
  exitCode !== "0" ? "error" : !initial.available ? "unavailable" : diffs ? "changed" : "matched";
mkdirSync(directory, { recursive: true });
writeFileSync(statusPath, JSON.stringify({ ...initial, status, diffs }, null, 2));
