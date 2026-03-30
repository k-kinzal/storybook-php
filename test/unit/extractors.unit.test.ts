import { describe, expect, it } from "vite-plus/test";
import {
  extractClasses,
  extractStandaloneFunctions,
} from "../../src/core/analysis/php-parser/extractors.js";

describe("extractors", () => {
  it("extracts standalone functions declared without bodies", () => {
    const functions = extractStandaloneFunctions(
      "<?php function preview(string $label): string; function render(): string { return ''; }",
      null,
    );

    expect(functions.map((fn) => fn.name)).toEqual(["preview", "render"]);
  });

  it("skips malformed params and handles enum and interface members without bodies", () => {
    const functions = extractStandaloneFunctions("<?php function broken(string): void {}", null);
    const interfaces = extractClasses(
      "interface Viewable { public function render(): string; } enum Tone { case Warm }",
      null,
    );

    expect(functions[0]?.params).toEqual([]);
    expect(interfaces[0]?.methods[0]?.name).toBe("render");
    expect(interfaces[1]?.enumCases).toEqual(["Warm"]);
  });

  it("skips incomplete standalone functions and class methods without terminators", () => {
    expect(extractStandaloneFunctions("<?php function preview(string $label)", null)).toEqual([]);
    expect(
      extractClasses("class Broken { public function render(): string }", null)[0]?.methods[0]
        ?.name,
    ).toBe("render");
  });
});
