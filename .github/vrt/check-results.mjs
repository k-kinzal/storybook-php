#!/usr/bin/env node
// Decide whether a PR VRT run passes.
//
// Visual diffs are expected on PRs and are reviewed through the VRT report, so
// a run that fails only because snapshots mismatched is treated as success.
// Anything else (render errors, story exceptions, import failures, unhandled
// errors, no tests at all) fails CI, because it would also fail on main.
//
// Usage: check-results.mjs <vitest-exit-code> <vitest-json-report> <vitest-log>

import { existsSync, readFileSync } from "node:fs";
import { relative } from "node:path";

const [exitCodeArg, reportPath, logPath] = process.argv.slice(2);
const exitCode = Number(exitCodeArg);

const SNAPSHOT_MISMATCH = /^(?:Aggregate)?Error: Snapshot `[^`]+` mismatched/;

function fail(message, details = []) {
  console.error(`::error title=VRT failed::${message}`);
  for (const line of details) console.error(line);
  process.exit(1);
}

if (exitCode === 0) {
  console.log("VRT passed with no visual diffs.");
  process.exit(0);
}

if (!existsSync(reportPath)) {
  fail(`Vitest exited with code ${exitCode} and wrote no JSON report.`);
}

const log = existsSync(logPath) ? readFileSync(logPath, "utf8") : "";
if (/Unhandled (?:Errors?|Rejection)/.test(log)) {
  fail("Vitest reported unhandled errors. See the 'Run VRT (compare)' log.");
}

const report = JSON.parse(readFileSync(reportPath, "utf8"));

if (report.numTotalTests === 0) {
  fail("No VRT tests were collected.");
}

const errors = [];
const mismatches = [];

for (const file of report.testResults) {
  const path = relative(process.cwd(), file.name);
  if (file.message) {
    errors.push(`${path}\n${file.message}`);
  }
  for (const test of file.assertionResults) {
    if (test.status !== "failed") continue;
    const messages = test.failureMessages;
    if (messages.length > 0 && messages.every((m) => SNAPSHOT_MISMATCH.test(m))) {
      mismatches.push(`${path} > ${test.fullName}`);
    } else {
      errors.push(`${path} > ${test.fullName}\n${messages.join("\n")}`);
    }
  }
}

if (errors.length > 0) {
  fail(
    `${errors.length} VRT test(s) failed for reasons other than visual diffs.`,
    errors.map((e) => `\n--- ${e}`),
  );
}

if (mismatches.length === 0) {
  fail(`Vitest exited with code ${exitCode} but no failed tests were reported.`);
}

console.log(`VRT found ${mismatches.length} visual diff(s); see the VRT report:`);
for (const name of mismatches) console.log(`  - ${name}`);
