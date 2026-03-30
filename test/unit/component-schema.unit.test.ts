import { describe, expect, it } from "vite-plus/test";
import {
  listCallableNames,
  resolveSchemasForSource,
} from "../../src/core/component/component-schema.js";
import { resolveFrameworkOptions } from "../../src/core/config/framework-config.js";
import { fixturePath } from "../helpers/core-test-helpers.js";

describe("component-schema", () => {
  it("lists callables for a source file", () => {
    const names = listCallableNames(fixturePath("SimpleComponent.php"), resolveFrameworkOptions());

    expect(names).toContain("render");
  });

  it("reports a missing callable when metadata is unavailable", () => {
    const result = resolveSchemasForSource(
      {
        sourceFile: "/tmp/partial.blade.php",
        executionFile: "/tmp/partial.blade.php",
        adapter: null,
        dependencies: ["/tmp/partial.blade.php"],
        meta: null,
        inlineArgs: null,
        mappedCallable: null,
      },
      "render",
    );

    expect(result.schemas).toEqual([]);
    expect(result.error).toContain('PHP callable "render" not found');
  });
});
