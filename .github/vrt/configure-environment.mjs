import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Pre-generate main's baselines before switching PRs to a new OS/font image.
// This changes only the capture environment, never the checked-out stories.
const image = process.env["VRT_CAPTURE_IMAGE"];
if (image) {
  if (
    process.env["GITHUB_REF"] !== "refs/heads/main" ||
    process.env["GITHUB_EVENT_NAME"] !== "workflow_dispatch"
  ) {
    throw new Error("Capture image overrides are restricted to manual runs on main.");
  }
  const path = resolve(import.meta.dirname, "../../examples/_shared/vrt-environment.json");
  const environment = JSON.parse(readFileSync(path, "utf8"));
  const prefix = `mcr.microsoft.com/playwright:v${environment.playwrightVersion}-`;
  if (
    !image.startsWith(prefix) ||
    !/^[a-z0-9.-]+@sha256:[a-f0-9]{64}$/.test(image.slice(prefix.length))
  ) {
    throw new Error(
      "Use an immutable official Playwright image matching the installed Playwright version.",
    );
  }
  writeFileSync(path, JSON.stringify({ ...environment, image }, null, 2) + "\n");
}
