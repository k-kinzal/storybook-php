// Called by vis immediately before capturing each story, after its play function.
export async function prepareScreenshot() {
  let timer;
  try {
    await Promise.race([
      prepareDocument(),
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Timed out waiting for images and fonts")),
          10000,
        );
      }),
    ]);
  } catch (error) {
    // Keep this distinct from snapshot mismatches: a broken fixture is a test error.
    throw new Error(`VRT preparation failed: ${error.message}`, { cause: error });
  } finally {
    clearTimeout(timer);
  }
}

async function prepareDocument() {
  await Promise.all([
    document.fonts.ready,
    ...Array.from(document.images, async (image) => {
      const url = new URL(image.currentSrc || image.src, document.baseURI);
      if (url.origin !== location.origin && !["data:", "blob:"].includes(url.protocol)) {
        throw new Error(`Use a local image fixture instead of ${url.href}`);
      }
      image.loading = "eager";
      await image.decode();
      if (image.naturalWidth === 0) throw new Error(`Image did not load: ${url.href}`);
    }),
  ]);

  for (const animation of document.getAnimations()) {
    if (animation.effect?.getComputedTiming().iterations === Infinity) animation.cancel();
    else animation.finish();
  }
  // Prevent transitions from starting again while taking the screenshot.
  if (!document.getElementById("vrt-stable-styles")) {
    const style = document.createElement("style");
    style.id = "vrt-stable-styles";
    style.textContent =
      "*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }";
    document.head.append(style);
  }
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}
