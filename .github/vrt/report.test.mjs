import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

await test("reports distinguish a clean comparison from an unavailable baseline", (t) => {
  const directory = mkdtempSync(join(tmpdir(), "vrt-report-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  for (const [example, status] of [
    ["basic", "matched"],
    ["laravel", "unavailable"],
    ["php81", "error"],
  ]) {
    const artifact = join(directory, "vrt-results", `vrt-results-${example}`);
    mkdirSync(artifact, { recursive: true });
    writeFileSync(join(artifact, "vrt-status.json"), JSON.stringify({ status, diffs: 0 }));
  }
  const result = spawnSync("bash", [resolve(import.meta.dirname, "generate-report.sh"), "109"], {
    cwd: directory,
    env: { ...process.env, GITHUB_ENV: join(directory, "env") },
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  const summary = readFileSync(join(directory, "diff-summary.md"), "utf8");
  assert.match(summary, /basic \| No visual changes/);
  assert.match(summary, /laravel \| Not compared/);
  assert.match(summary, /php81 \| VRT could not complete/);
  assert.match(readFileSync(join(directory, "vrt-report.html"), "utf8"), /Not compared/);
});

await test("missing artifacts still replace a stale PR summary", (t) => {
  const directory = mkdtempSync(join(tmpdir(), "vrt-no-artifacts-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const result = spawnSync("bash", [resolve(import.meta.dirname, "generate-report.sh"), "109"], {
    cwd: directory,
    env: { ...process.env, GITHUB_ENV: join(directory, "env") },
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  const summary = readFileSync(join(directory, "diff-summary.md"), "utf8");
  assert.match(summary, /basic \| VRT could not complete/);
  assert.doesNotMatch(summary, /No visual changes/);
});
