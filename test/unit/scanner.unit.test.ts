import { describe, expect, it } from "vite-plus/test";
import { readSignatureTail } from "../../src/core/analysis/php-parser/scanner.js";

describe("scanner", () => {
  it("parses shaped return types and missing terminators", () => {
    expect(readSignatureTail(": (array{foo:string});", 0)).toEqual({
      returnType: "(array{foo:string})",
      terminator: ";",
      terminatorIndex: ": (array{foo:string});".length - 1,
    });

    expect(readSignatureTail(": (array{foo:string})", 0)).toEqual({
      returnType: "(array{foo:string})",
      terminator: null,
      terminatorIndex: ": (array{foo:string})".length,
    });
  });

  it("parses non-type signature tails and bracketed return segments", () => {
    expect(readSignatureTail("{", 0)).toEqual({
      returnType: null,
      terminator: "{",
      terminatorIndex: 0,
    });
    expect(readSignatureTail("x", 0)).toEqual({
      returnType: null,
      terminator: null,
      terminatorIndex: 0,
    });
    expect(readSignatureTail(": ;", 0)).toEqual({
      returnType: null,
      terminator: ";",
      terminatorIndex: 2,
    });
    expect(readSignatureTail(": array[0];", 0)).toEqual({
      returnType: "array[0]",
      terminator: ";",
      terminatorIndex: ": array[0];".length - 1,
    });
  });
});
