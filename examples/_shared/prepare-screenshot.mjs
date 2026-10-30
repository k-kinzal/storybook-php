// Called by vis immediately before capturing each story, after its play function.
export async function prepareScreenshot() {
  await document.fonts.ready;
  await Promise.all(
    Array.from(document.images, async (image) => {
      image.loading = "eager";
      await image.decode();
    }),
  );
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}
