import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import ts from "typescript";
import { createPhpResolver } from "../ts-plugin/resolver.js";

const FIXTURES = resolve(__dirname, "fixtures");

describe("resolver coverage extras", () => {
  let tempDir = "";

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "sbphp-resolver-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("returns null when metadata cannot be read from disk", () => {
    const resolver = createPhpResolver(ts);
    const brokenPath = join(tempDir, "directory.php");
    mkdirSync(brokenPath);

    expect(resolver.getPhpMeta(brokenPath)).toBeNull();
  });

  it("reuses cached virtual declarations and handles broken declaration targets", () => {
    const resolver = createPhpResolver(ts, "render");
    const virtualPath = `${fixturePath("SimpleComponent.php")}@render.d.ts`;

    const first = resolver.getVirtualDeclaration(virtualPath);
    const second = resolver.getVirtualDeclaration(virtualPath);

    expect(second).toBe(first);

    const brokenImport = join(tempDir, "broken.php");
    mkdirSync(brokenImport);
    const brokenVirtualPath = `${brokenImport}.d.ts`;

    expect(resolver.getVirtualDeclaration(brokenVirtualPath)).toBeNull();
    expect(resolver.getVirtualDeclarationVersion(brokenVirtualPath)).toBeNull();
  });

  it("returns null for virtual declarations whose source file does not exist", () => {
    const resolver = createPhpResolver(ts, "render");

    expect(resolver.getVirtualDeclaration(join(tempDir, "missing.php.d.ts"))).toBeNull();
    expect(resolver.getVirtualDeclarationPath("./missing.ts", fixturePath("SimpleComponent.php"))).toBeNull();
  });
});

function fixturePath(name: string): string {
  return resolve(FIXTURES, name);
}
