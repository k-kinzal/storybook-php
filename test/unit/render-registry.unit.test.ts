import { describe, expect, it } from "vite-plus/test";
import { RenderRegistry } from "../../src/runtime/render/render-registry.js";

describe("render-registry", () => {
  it("returns null for missing registry entries", () => {
    const registry = new RenderRegistry();

    expect(registry.get("missing")).toBeNull();
  });
});
