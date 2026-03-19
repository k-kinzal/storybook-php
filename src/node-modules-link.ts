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
  let stat;
  try {
    stat = lstatSync(path);
  } catch {
    return "absent";
  }
  if (stat.isSymbolicLink()) return "symlink";
  if (!stat.isDirectory()) return "absent";
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

  try {
    symlinkSync(targetPath, localPath, "junction");
  } catch {
    // Restore backup if symlink creation failed
    if (backedUp && existsSync(backedUp)) {
      renameSync(backedUp, localPath);
    }
    return null;
  }

  return () => {
    try {
      const s = lstatSync(localPath);
      if (s.isSymbolicLink()) unlinkSync(localPath);
    } catch {
      // already gone
    }
    try {
      if (backedUp && existsSync(backedUp)) {
        renameSync(backedUp, localPath);
      }
    } catch {
      // best-effort cleanup
    }
  };
}
