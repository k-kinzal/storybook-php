import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { inspectBaseline, snapshotFiles } from "./baseline.mjs";

const expected = {
  schema: 1,
  sourceSha: "a".repeat(40),
  environment: "capture-v1",
  example: "basic",
  php: "8.4",
};

await test("a missing main baseline is unavailable, never implicitly accepted", () => {
  assert.equal(inspectBaseline("/nonexistent-vrt-baseline", expected).available, false);
});

await test("baseline provenance and complete image inventory are required", (t) => {
  const directory = mkdtempSync(join(tmpdir(), "vrt-baseline-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  mkdirSync(join(directory, "Button.stories.ts"));
  writeFileSync(join(directory, "Button.stories.ts/default-auto.png"), "fixture");
  const manifest = { ...expected, files: snapshotFiles(directory) };
  const save = (data) => writeFileSync(join(directory, "manifest.json"), JSON.stringify(data));
  save(manifest);
  assert.equal(inspectBaseline(directory, expected).available, true);
  for (const [key, value] of [
    ["sourceSha", "b".repeat(40)],
    ["environment", "other-browser"],
    ["example", "laravel"],
    ["php", "8.1"],
  ]) {
    save({ ...manifest, [key]: value });
    assert.equal(inspectBaseline(directory, expected).available, false, key);
  }
  save(manifest);
  rmSync(join(directory, manifest.files[0]));
  assert.throws(() => inspectBaseline(directory, expected), /incomplete/);
});

await test("pull-request jobs cannot publish main baselines", () => {
  const result = spawnSync(
    process.execPath,
    [resolve(import.meta.dirname, "baseline.mjs"), "publish", "basic", "8.4", expected.sourceSha],
    {
      env: { ...process.env, GITHUB_REF: "refs/pull/110/merge", GITHUB_EVENT_NAME: "pull_request" },
      encoding: "utf8",
    },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Only the main workflow/);
});

await test("a successful render without a baseline remains not compared", (t) => {
  const directory = mkdtempSync(join(tmpdir(), "vrt-status-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  writeFileSync(
    join(directory, "vrt-status.json"),
    JSON.stringify({ ...expected, available: false }),
  );
  const result = spawnSync(
    process.execPath,
    [resolve(import.meta.dirname, "record-result.mjs"), directory, "0"],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  const status = JSON.parse(readFileSync(join(directory, "vrt-status.json"), "utf8"));
  assert.equal(status.status, "unavailable");
});
