import { describe, it, expect, vi } from "vite-plus/test";
import { core, viteFinal } from "../../src/preset.js";

type NamedPlugin = {
  name: string;
};

/** Helper: create mock SB10 options with presets.apply */
function mockOptions(frameworkOptions: Record<string, unknown> = {}) {
  return {
    presets: {
      apply: vi.fn().mockResolvedValue(frameworkOptions),
    },
  };
}

function getPlugins(result: { plugins?: unknown }): NamedPlugin[] {
  if (!Array.isArray(result.plugins)) {
    return [];
  }

  return result.plugins as NamedPlugin[];
}

describe("preset", () => {
  describe("core", () => {
    it("has builder and renderer fields", () => {
      expect(core.builder).toBe("@storybook/builder-vite");
      expect(core.renderer).toBe("storybook-php");
    });
  });

  describe("viteFinal", () => {
    it("adds PHP plugin to config plugins", async () => {
      const config = {};
      const result = await viteFinal(config, mockOptions());

      const plugins = getPlugins(result);
      expect(Array.isArray(plugins)).toBe(true);
      expect(plugins.length).toBe(1);
      expect(plugins[0]?.name).toBe("storybook-php");
    });

    it("preserves existing plugins", async () => {
      const existingPlugin = { name: "existing-plugin" };
      const config = { plugins: [existingPlugin] };
      const result = await viteFinal(config, mockOptions());

      const plugins = getPlugins(result);
      expect(plugins.length).toBe(2);
      expect(plugins[0]).toBe(existingPlugin);
      expect(plugins[1]?.name).toBe("storybook-php");
    });

    it("works with empty config", async () => {
      const result = await viteFinal({}, mockOptions());

      expect(result).toBeDefined();
      const plugins = getPlugins(result);
      expect(Array.isArray(plugins)).toBe(true);
      expect(plugins.some((plugin) => plugin.name === "storybook-php")).toBe(true);
    });

    it("passes framework options from presets.apply to plugin", async () => {
      const opts = mockOptions({ bootstrap: "/path/to/bootstrap.php", timeout: 3000 });
      const result = await viteFinal({}, opts);

      expect(opts.presets.apply).toHaveBeenCalledWith("frameworkOptions", {});
      const plugins = getPlugins(result);
      expect(plugins[0]?.name).toBe("storybook-php");
    });

    it("falls back to empty framework options when presets.apply returns undefined", async () => {
      const config = await viteFinal(
        { plugins: [] },
        {
          configDir: import.meta.dirname!,
          presets: {
            apply: vi.fn().mockResolvedValue(undefined),
          },
        },
      );

      expect(core.renderer).toBe("storybook-php");
      expect(config.plugins).toHaveLength(1);
    });
  });
});
