import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  symlinkSync,
  existsSync,
  lstatSync,
  readlinkSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { detectNodeModulesState, ensureLink } from "../cli/node-modules-link.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), "sbphp-test-"));
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

/** Helper: path to node_modules inside the temp dir */
function nm(): string {
  return join(tmpDir, "node_modules");
}

/** Helper: create a directory to serve as the symlink target */
function createTargetWithPackage(): string {
  const target = join(tmpDir, "target_node_modules");
  mkdirSync(join(target, "storybook-php"), { recursive: true });
  writeFileSync(join(target, "storybook-php", "package.json"), "{}");
  return target;
}

// ---------------------------------------------------------------------------
// detectNodeModulesState
// ---------------------------------------------------------------------------

describe("detectNodeModulesState", () => {
  it("returns 'absent' when path does not exist", () => {
    expect(detectNodeModulesState(nm())).toBe("absent");
  });

  it("returns 'symlink' when path is a symbolic link", () => {
    const target = join(tmpDir, "some_target");
    mkdirSync(target);
    symlinkSync(target, nm(), "junction");

    expect(detectNodeModulesState(nm())).toBe("symlink");
  });

  it("returns 'real-with-packages' when directory has non-dot entries", () => {
    mkdirSync(nm());
    mkdirSync(join(nm(), "some-package"));

    expect(detectNodeModulesState(nm())).toBe("real-with-packages");
  });

  it("returns 'real-with-packages' when directory has scoped packages", () => {
    mkdirSync(nm());
    mkdirSync(join(nm(), "@storybook"), { recursive: true });
    // @storybook doesn't start with "." but is a real package scope
    expect(detectNodeModulesState(nm())).toBe("real-with-packages");
  });

  it("returns 'real-empty-or-cache' when directory is empty", () => {
    mkdirSync(nm());

    expect(detectNodeModulesState(nm())).toBe("real-empty-or-cache");
  });

  it("returns 'real-empty-or-cache' when directory only has dotfiles", () => {
    mkdirSync(nm());
    mkdirSync(join(nm(), ".cache"));
    writeFileSync(join(nm(), ".package-lock.json"), "{}");

    expect(detectNodeModulesState(nm())).toBe("real-empty-or-cache");
  });

  it("returns 'symlink' when symlink target does not exist (dangling)", () => {
    symlinkSync("/nonexistent/path", nm(), "junction");

    expect(detectNodeModulesState(nm())).toBe("symlink");
  });

  it("returns 'absent' when path is a file, not a directory", () => {
    writeFileSync(nm(), "not a directory");

    expect(detectNodeModulesState(nm())).toBe("absent");
  });
});

// ---------------------------------------------------------------------------
// ensureLink
// ---------------------------------------------------------------------------

describe("ensureLink", () => {
  describe("when node_modules does not exist", () => {
    it("creates a symlink and returns a cleanup function", () => {
      const target = createTargetWithPackage();
      const cleanup = ensureLink(nm(), target);

      expect(cleanup).toBeTypeOf("function");
      expect(existsSync(nm())).toBe(true);
      expect(lstatSync(nm()).isSymbolicLink()).toBe(true);
      expect(readlinkSync(nm())).toBe(target);
    });

    it("cleanup removes the symlink", () => {
      const target = createTargetWithPackage();
      const cleanup = ensureLink(nm(), target)!;

      cleanup();

      expect(existsSync(nm())).toBe(false);
    });
  });

  describe("when node_modules is an existing symlink", () => {
    it("returns null and leaves the symlink unchanged", () => {
      const target = join(tmpDir, "existing_target");
      mkdirSync(target);
      symlinkSync(target, nm(), "junction");

      const result = ensureLink(nm(), "/some/other/path");

      expect(result).toBeNull();
      expect(readlinkSync(nm())).toBe(target);
    });
  });

  describe("when node_modules contains real packages", () => {
    it("returns null and does not modify the directory", () => {
      mkdirSync(nm());
      mkdirSync(join(nm(), "some-package"));
      writeFileSync(join(nm(), "some-package", "index.js"), "");

      const result = ensureLink(nm(), "/some/other/path");

      expect(result).toBeNull();
      expect(lstatSync(nm()).isSymbolicLink()).toBe(false);
      expect(existsSync(join(nm(), "some-package", "index.js"))).toBe(true);
    });
  });

  describe("when node_modules contains only dotfiles (.cache)", () => {
    it("creates a symlink and returns a cleanup function", () => {
      mkdirSync(nm());
      mkdirSync(join(nm(), ".cache"));
      writeFileSync(join(nm(), ".cache", "data"), "cached");

      const target = createTargetWithPackage();
      const cleanup = ensureLink(nm(), target);

      expect(cleanup).toBeTypeOf("function");
      expect(lstatSync(nm()).isSymbolicLink()).toBe(true);
      expect(readlinkSync(nm())).toBe(target);
    });

    it("cleanup restores the original directory with its contents", () => {
      mkdirSync(nm());
      mkdirSync(join(nm(), ".cache"));
      writeFileSync(join(nm(), ".cache", "data"), "cached");

      const target = createTargetWithPackage();
      const cleanup = ensureLink(nm(), target)!;

      cleanup();

      expect(lstatSync(nm()).isSymbolicLink()).toBe(false);
      expect(lstatSync(nm()).isDirectory()).toBe(true);
      expect(existsSync(join(nm(), ".cache", "data"))).toBe(true);
    });

    it("cleanup leaves no backup remnant", () => {
      mkdirSync(nm());
      mkdirSync(join(nm(), ".cache"));

      const target = createTargetWithPackage();
      const cleanup = ensureLink(nm(), target)!;

      cleanup();

      const entries = readdirSync(tmpDir);
      expect(entries).not.toContain("node_modules.__sbphp_bak__");
    });
  });

  describe("when node_modules is an empty directory", () => {
    it("creates a symlink and returns a cleanup function", () => {
      mkdirSync(nm());

      const target = createTargetWithPackage();
      const cleanup = ensureLink(nm(), target);

      expect(cleanup).toBeTypeOf("function");
      expect(lstatSync(nm()).isSymbolicLink()).toBe(true);
    });

    it("cleanup restores the empty directory", () => {
      mkdirSync(nm());

      const target = createTargetWithPackage();
      const cleanup = ensureLink(nm(), target)!;

      cleanup();

      expect(lstatSync(nm()).isDirectory()).toBe(true);
      expect(lstatSync(nm()).isSymbolicLink()).toBe(false);
      expect(readdirSync(nm())).toEqual([]);
    });
  });

  describe("when node_modules is a dangling symlink", () => {
    it("returns null and leaves the symlink unchanged", () => {
      symlinkSync("/nonexistent/path", nm(), "junction");

      const target = createTargetWithPackage();
      const result = ensureLink(nm(), target);

      expect(result).toBeNull();
      expect(readlinkSync(nm())).toBe("/nonexistent/path");
    });
  });

  describe("when node_modules is a file", () => {
    it("returns null because symlinkSync cannot replace a file", () => {
      writeFileSync(nm(), "not a directory");

      const target = createTargetWithPackage();
      const result = ensureLink(nm(), target);

      expect(result).toBeNull();
    });
  });

  describe("when a stale backup exists from a previous crash", () => {
    it("removes the stale backup and restores from the current state", () => {
      mkdirSync(nm());
      mkdirSync(join(nm(), ".cache"));

      const staleBackup = nm() + ".__sbphp_bak__";
      mkdirSync(staleBackup);
      mkdirSync(join(staleBackup, ".old-cache"));

      const target = createTargetWithPackage();
      const cleanup = ensureLink(nm(), target);

      expect(cleanup).toBeTypeOf("function");
      expect(lstatSync(nm()).isSymbolicLink()).toBe(true);

      cleanup!();

      expect(existsSync(join(nm(), ".cache"))).toBe(true);
      expect(existsSync(join(nm(), ".old-cache"))).toBe(false);
    });
  });
});
