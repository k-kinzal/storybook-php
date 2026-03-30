import { describe, expect, it } from "vite-plus/test";
import {
  generateDeclarationOutputsForResolvedSource,
  versionForResolvedSource,
} from "../../src/core/typescript/declaration-files.js";
import { resolveComponentSource } from "../../src/core/component/component-source.js";
import { resolveFrameworkOptions } from "../../src/core/config/framework-config.js";
import { FIXTURES, fixturePath } from "../helpers/core-test-helpers.js";

describe("declaration-files", () => {
  it("skips outputs when a mapped callable cannot be resolved", () => {
    const resolved = resolveComponentSource(
      fixturePath("SimpleComponent.php"),
      resolveFrameworkOptions({
        _configDir: FIXTURES,
        typeMap: {
          files: {
            "SimpleComponent.php": {
              callable: "missingMethod",
            },
          },
        },
      }),
    );

    expect(generateDeclarationOutputsForResolvedSource(resolved, null)).toEqual([]);
  });

  it("includes missing dependencies in the version hash", () => {
    const version = versionForResolvedSource({
      sourceFile: fixturePath("SimpleComponent.php"),
      executionFile: fixturePath("SimpleComponent.php"),
      adapter: null,
      dependencies: [fixturePath("SimpleComponent.php"), "/tmp/missing.php"],
      meta: null,
      fileArgOverrides: null,
      callableArgOverrides: {},
      mappedCallable: null,
    });

    expect(version).toContain(`${fixturePath("SimpleComponent.php")}:`);
    expect(version).toContain("/tmp/missing.php:-1");
  });
});
