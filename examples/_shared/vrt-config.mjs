import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const environment = JSON.parse(
  readFileSync(new URL("./vrt-environment.json", import.meta.url), "utf8"),
);
export const publicDir = fileURLToPath(new URL("./public", import.meta.url));
export const screenshotDefines = {
  __VRT_COMPARE__: process.env["VRT_COMPARE"] !== "false",
};

const wsEndpoint = process.env["VRT_BROWSER_WS_ENDPOINT"];
if (process.env["GITHUB_ACTIONS"] === "true" && !wsEndpoint) {
  throw new Error("CI visual tests must use the pinned VRT browser container.");
}

export const browserOptions = {
  launchOptions: environment.launchOptions,
  contextOptions: environment.contextOptions,
  ...(wsEndpoint ? { connectOptions: { wsEndpoint, exposeNetwork: "<loopback>" } } : {}),
};
