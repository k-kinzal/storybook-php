import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout } from "node:timers/promises";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const example = process.argv[2];
if (!/^[a-z0-9-]+$/.test(example ?? "")) throw new Error("Expected an example name");
const environment = JSON.parse(
  readFileSync(resolve(root, "examples/_shared/vrt-environment.json"), "utf8"),
);
const packageDir = resolve(root, "examples", example, "node_modules/playwright");
const installed = JSON.parse(readFileSync(resolve(packageDir, "package.json"), "utf8"));
if (installed.version !== environment.playwrightVersion) {
  throw new Error(
    `Playwright ${installed.version} does not match the capture image (${environment.playwrightVersion}). Update both together.`,
  );
}
if (!/@sha256:[a-f0-9]{64}$/.test(environment.image))
  throw new Error("Capture image must be pinned by digest");

const name = `storybook-php-vrt-${example}`;
const docker = spawnSync(
  "docker",
  [
    "run",
    "--detach",
    "--rm",
    "--init",
    "--ipc=host",
    "--platform",
    environment.platform,
    "--name",
    name,
    "--publish",
    "127.0.0.1:6677:6677",
    "--volume",
    `${root}:/work:ro`,
    environment.image,
    "node",
    `/work/examples/${example}/node_modules/playwright/cli.js`,
    "run-server",
    "--port",
    "6677",
    "--host",
    "0.0.0.0",
  ],
  { stdio: "inherit" },
);
if (docker.status !== 0) process.exit(docker.status ?? 1);

for (let attempt = 0; attempt < 60; attempt++) {
  try {
    await fetch("http://127.0.0.1:6677/", { signal: AbortSignal.timeout(1000) });
    console.log(`VRT browser ready: ${name}`);
    process.exit(0);
  } catch {
    await setTimeout(1000);
  }
}
spawnSync("docker", ["logs", name], { stdio: "inherit" });
spawnSync("docker", ["stop", name], { stdio: "inherit" });
throw new Error("VRT browser did not become ready");
