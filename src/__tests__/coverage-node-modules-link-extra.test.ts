import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import * as fs from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("node-modules-link coverage extras", () => {
  let tempDir = "";

  beforeEach(() => {
    tempDir = fs.mkdtempSync(join(tmpdir(), "sbphp-link-"));
    vi.restoreAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("restores the backup when symlink creation fails after a rename", async () => {
    const localPath = join(tempDir, "node_modules");
    fs.mkdirSync(localPath);
    fs.mkdirSync(join(localPath, ".cache"));

    vi.doMock("node:fs", async () => {
      const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
      return {
        ...actual,
        symlinkSync: vi.fn(() => {
          throw new Error("symlink failed");
        }),
      };
    });

    const { detectNodeModulesState, ensureLink } = await import("../cli/node-modules-link.js");

    expect(ensureLink(localPath, "/tmp/target")).toBeNull();
    expect(detectNodeModulesState(localPath)).toBe("real-empty-or-cache");
    expect(fs.existsSync(localPath + ".__sbphp_bak__")).toBe(false);
  });

  it("removes created symlinks during cleanup", async () => {
    const target = join(tempDir, "target_node_modules");
    fs.mkdirSync(join(target, "storybook-php"), { recursive: true });

    const { ensureLink } = await import("../cli/node-modules-link.js");
    const localPath = join(tempDir, "linked_node_modules");
    const cleanup = ensureLink(localPath, target);

    cleanup?.();

    expect(fs.existsSync(localPath)).toBe(false);
  });

  it("skips unlink when the symlink is already gone before cleanup", async () => {
    const target = join(tempDir, "target_node_modules_2");
    fs.mkdirSync(join(target, "storybook-php"), { recursive: true });

    vi.doUnmock("node:fs");
    const { ensureLink } = await import("../cli/node-modules-link.js");
    const localPath = join(tempDir, "linked_node_modules_2");
    const cleanup = ensureLink(localPath, target);
    expect(cleanup).toBeTypeOf("function");
    fs.unlinkSync(localPath);

    cleanup?.();

    expect(fs.existsSync(localPath)).toBe(false);
  });
});
