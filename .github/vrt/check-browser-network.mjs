import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import { browserOptions } from "../../examples/_shared/vrt-config.mjs";

// Resolve the same Playwright version as the example, including pnpm installations.
const { chromium } = createRequire(resolve("package.json"))("playwright");
assert(browserOptions.connectOptions, "Start the isolated VRT browser container first.");

const server = createServer((_request, response) => response.end("local story"));
server.listen(0, "127.0.0.1");
await once(server, "listening");

let browser;
try {
  browser = await chromium.connect(browserOptions.connectOptions.wsEndpoint, {
    ...browserOptions.connectOptions,
    timeout: 10_000,
  });
  // Vitest's Playwright provider also ignores certificate errors. This check must
  // prove network isolation, rather than passing because TLS rejects a request.
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  const localURL = `http://127.0.0.1:${server.address().port}/`;
  await page.goto(localURL, { timeout: 10_000 });
  assert.equal(await page.textContent("body"), "local story");

  // A numeric address checks routing even when external DNS is unavailable.
  // The container has no external route; no response (including an HTTP error)
  // is acceptable. Certificate validation is deliberately irrelevant here.
  for (const url of ["https://1.1.1.1/", "http://1.1.1.1/"]) {
    await assert.rejects(
      page.goto(url, { waitUntil: "commit", timeout: 5_000 }),
      /net::ERR_(ADDRESS_UNREACHABLE|NETWORK_UNREACHABLE|CONNECTION_TIMED_OUT|SOCKS_CONNECTION_FAILED)/,
    );
  }
  console.log(`Chromium ${browser.version()}: loopback works; external HTTP(S) is blocked.`);
} finally {
  await browser?.close();
  server.close();
}
