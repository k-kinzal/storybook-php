import { describe, expect, it } from "vite-plus/test";
import { preprocess } from "../../src/core/analysis/php-parser/preprocess.js";

describe("preprocess", () => {
  it("handles EOF comments and escaped backticks during preprocessing", () => {
    const processed = preprocess("<?php $cmd = `echo \\`whoami\\``; // trailing comment");

    expect(processed).toContain("`__PLACEHOLDER__`");
    expect(processed).not.toContain("// trailing comment");
  });

  it("masks block comments, hash comments, and attributes", () => {
    const processed = preprocess("<?php /* block */\n# hash comment\n#[Attr([1])]\nclass Demo {}");

    expect(processed).not.toContain("block");
    expect(processed).not.toContain("hash comment");
    expect(processed).not.toContain("Attr");
    expect(processed).toContain("class Demo {}");
  });

  it("keeps malformed block comments and incomplete heredocs stable", () => {
    expect(preprocess("<?php /* unterminated")).toContain("/* unterminated");
    expect(preprocess("<?php $value = <<<TXT\nbody")).toContain("<<<TXT");
    expect(preprocess("<?php $value = <<<\nbody")).toContain("<<<");
    expect(preprocess("<?php $value = <<<TXT\nbody\nTXT")).toContain("__PLACEHOLDER__");
    expect(preprocess("<?php # comment")).not.toContain("# comment");
  });
});
