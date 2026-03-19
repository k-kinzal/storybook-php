import {
  existsSync,
  lstatSync,
  readdirSync,
  renameSync,
  rmSync,
  symlinkSync,
  unlinkSync,
} from "node:fs";

export type NodeModulesState = "absent" | "symlink" | "real-with-packages" | "real-empty-or-cache";

export function detectNodeModulesState(path: string): NodeModulesState {
  if (!existsSync(path)) return "absent";
  if (lstatSync(path).isSymbolicLink()) return "symlink";
  const hasPackages = readdirSync(path).some((e) => !e.startsWith("."));
  return hasPackages ? "real-with-packages" : "real-empty-or-cache";
}

const BACKUP_SUFFIX = ".__sbphp_bak__";

/**
 * Ensure a node_modules symlink exists at `localPath` pointing to `targetPath`.
 * Returns a cleanup function, or null if no action was needed.
 */
export function ensureLink(localPath: string, targetPath: string): (() => void) | null {
  const state = detectNodeModulesState(localPath);

  if (state === "symlink" || state === "real-with-packages") {
    return null;
  }

  let backedUp: string | null = null;

  if (state === "real-empty-or-cache") {
    backedUp = localPath + BACKUP_SUFFIX;
    // Clean up leftover backup from a previous crash
    if (existsSync(backedUp)) {
      rmSync(backedUp, { recursive: true });
    }
    renameSync(localPath, backedUp);
  }

  symlinkSync(targetPath, localPath, "junction");

  return () => {
    try {
      if (existsSync(localPath) && lstatSync(localPath).isSymbolicLink()) {
        unlinkSync(localPath);
      }
      if (backedUp && existsSync(backedUp)) {
        renameSync(backedUp, localPath);
      }
    } catch {
      // best-effort cleanup
    }
  };
}
