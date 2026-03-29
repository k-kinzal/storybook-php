import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { loadFrameworkOptionsFile } from "../../src/cli/framework-options-loader.js";

describe("framework-options-loader", () => {
  let tempDir = "";

  beforeEach(() => {
    tempDir = mkdtempSync(join(resolve(process.cwd(), "build"), "sbphp-runtime-"));
  });

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("returns an empty object when no options file is provided", async () => {
    await expect(loadFrameworkOptionsFile(undefined, tempDir)).resolves.toEqual({});
  });

  it("loads JSON and module-based framework options", async () => {
    writeFileSync(
      join(tempDir, "options.json"),
      JSON.stringify({ defaultMethod: "render", _configDir: "/tmp/config" }),
    );
    writeFileSync(
      join(tempDir, "options.mjs"),
      "export default { defaultMethod: 'preview', typeMap: { args: {} } };",
    );
    writeFileSync(join(tempDir, "named.mjs"), "export const defaultMethod = 'named';");

    await expect(loadFrameworkOptionsFile("options.json", tempDir)).resolves.toEqual({
      defaultMethod: "render",
      _configDir: "/tmp/config",
    });
    await expect(loadFrameworkOptionsFile("options.mjs", tempDir)).resolves.toEqual({
      defaultMethod: "preview",
      typeMap: { args: {} },
    });
    await expect(loadFrameworkOptionsFile("named.mjs", tempDir)).resolves.toMatchObject({
      defaultMethod: "named",
    });
    await expect(loadFrameworkOptionsFile(join(tempDir, "options.json"), tempDir)).resolves.toEqual(
      {
        defaultMethod: "render",
        _configDir: "/tmp/config",
      },
    );
  });

  it("rejects non-object exports", async () => {
    writeFileSync(join(tempDir, "bad.mjs"), "export default [];");

    await expect(loadFrameworkOptionsFile("bad.mjs", tempDir)).rejects.toThrow(
      "Framework options file must export an object",
    );
  });
});
