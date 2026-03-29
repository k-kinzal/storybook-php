import { describe, expect, it } from "vite-plus/test";
import { phpTypeToTs } from "../../src/core/typescript/php-type-to-ts.js";

describe("php-type-to-ts", () => {
  it("maps arrays, nullable shorthand, and special scalar forms", () => {
    expect(phpTypeToTs("array", true, "int")).toBe("number[] | null");
    expect(phpTypeToTs("array", false, "int")).toBe("number[]");
    expect(phpTypeToTs("?string")).toBe("string | null");
    expect(phpTypeToTs(null, true)).toBe("unknown | null");
    expect(phpTypeToTs(null, false)).toBe("unknown");
    expect(phpTypeToTs("int|string", true)).toBe("number | string | null");
    expect(phpTypeToTs("void")).toBe("void");
    expect(phpTypeToTs("null")).toBe("null");
    expect(phpTypeToTs("true")).toBe("true");
    expect(phpTypeToTs("false")).toBe("false");
    expect(phpTypeToTs("self")).toBe("Record<string, unknown>");
    expect(phpTypeToTs("static")).toBe("Record<string, unknown>");
    expect(phpTypeToTs("parent")).toBe("Record<string, unknown>");
  });
});
