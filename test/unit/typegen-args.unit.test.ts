import { describe, expect, it } from "vite-plus/test";
import { parseTypegenArgs, TypegenArgsError } from "../../src/cli/typegen-args.js";

describe("typegen-args", () => {
  it("parses directories without an options file", () => {
    expect(parseTypegenArgs(["src", "examples"])).toEqual({
      dirs: ["src", "examples"],
    });
  });

  it("parses --options-file in separate and inline forms", () => {
    expect(parseTypegenArgs(["src", "--options-file", "storybook-php.config.json"])).toEqual({
      dirs: ["src"],
      optionsFile: "storybook-php.config.json",
    });

    expect(parseTypegenArgs(["src", "--options-file=storybook-php.config.json"])).toEqual({
      dirs: ["src"],
      optionsFile: "storybook-php.config.json",
    });
  });

  it("rejects --options-file without a value", () => {
    expect(() => parseTypegenArgs(["src", "--options-file"])).toThrow(TypegenArgsError);
    expect(() => parseTypegenArgs(["src", "--options-file"])).toThrow(
      "Missing value for --options-file.",
    );
  });

  it("rejects --options-file when another flag appears instead of a path", () => {
    expect(() => parseTypegenArgs(["--options-file", "--help"])).toThrow(TypegenArgsError);
    expect(() => parseTypegenArgs(["--options-file="])).toThrow(TypegenArgsError);
  });
});
