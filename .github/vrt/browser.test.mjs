import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

const example = process.env["VRT_TEST_EXAMPLE"];
await test(
  "capture waits for local images and rejects broken or external images",
  { skip: !example },
  async (t) => {
    const root = resolve(import.meta.dirname, "../..");
    const { chromium } = await import(
      pathToFileURL(resolve(root, "examples", example, "node_modules/playwright/index.mjs")).href
    );
    const browser = await chromium.connect(process.env["VRT_BROWSER_WS_ENDPOINT"]);
    t.after(() => browser.close());
    const page = await browser.newPage();
    let releaseImage;
    const imageReady = new Promise((resolveImage) => {
      releaseImage = resolveImage;
    });
    await page.route("http://vrt.invalid/**", async (route) => {
      if (route.request().url().endsWith("/delayed.svg")) {
        await imageReady;
        await route.fulfill({
          contentType: "image/svg+xml",
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="blue"/></svg>',
        });
      } else if (route.request().url().endsWith("/broken.png")) {
        await route.fulfill({ status: 404, body: "missing" });
      } else {
        await route.fulfill({ contentType: "text/html", body: "<html><body></body></html>" });
      }
    });
    await page.goto("http://vrt.invalid/");
    const source = readFileSync(resolve(root, "examples/_shared/prepare-screenshot.mjs"), "utf8");
    await page.addScriptTag({ content: source.replace("export async function", "async function") });
    await page.evaluate(() => {
      document.body.innerHTML = '<img src="/delayed.svg">';
    });
    assert.equal(await page.evaluate(() => document.images[0].complete), false);
    const preparation = page.evaluate(() => window.prepareScreenshot());
    releaseImage();
    await preparation;
    assert.equal(await page.evaluate(() => document.images[0].naturalWidth), 32);

    await page.evaluate(() => {
      document.body.innerHTML = '<img src="/broken.png">';
    });
    await assert.rejects(
      page.evaluate(() => window.prepareScreenshot()),
      /VRT preparation failed/,
    );
    await page.evaluate(() => {
      document.body.innerHTML = '<img src="https://example.invalid/avatar.png">';
    });
    await assert.rejects(
      page.evaluate(() => window.prepareScreenshot()),
      /Use a local image fixture/,
    );
  },
);
