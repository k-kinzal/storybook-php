import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const results = resolve(process.argv[2]);
const examples = resolve(import.meta.dirname, "../../examples");
console.log("| Example | Result |\n|---------|--------|");
for (const example of readdirSync(examples).sort()) {
  if (!existsSync(resolve(examples, example, "vitest.config.ts"))) continue;
  const file = resolve(results, `vrt-results-${example}`, "vrt-status.json");
  const status = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : { status: "error" };
  const message =
    {
      matched: "No visual changes",
      changed: `${status.diffs} visual diff(s)`,
      unavailable: "Not compared: matching main baseline is not available",
      error: "VRT could not complete; see the job log",
    }[status.status] ?? "Unknown VRT result";
  console.log(`| ${example} | ${message} |`);
}
