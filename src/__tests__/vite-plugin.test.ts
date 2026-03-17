import { describe, it, expect, vi } from 'vitest';
import { storybookPhpPlugin, VIRTUAL_PREFIX } from '../vite-plugin.js';
import { resolve } from 'node:path';

const FIXTURES = resolve(__dirname, 'fixtures');

// Helper to call resolveId on the plugin
function getResolveId(plugin: ReturnType<typeof storybookPhpPlugin>) {
  return (plugin as any).resolveId as (source: string, importer?: string) => string | null;
}

// Helper to call load on the plugin
function getLoad(plugin: ReturnType<typeof storybookPhpPlugin>) {
  return (plugin as any).load as (id: string) => string | null;
}

describe('Vite Plugin', () => {
  // -----------------------------------------------------------------------
  // resolveId tests
  // -----------------------------------------------------------------------
  describe('resolveId', () => {
    it('resolves .php@render with importer to virtual ID', () => {
      const plugin = storybookPhpPlugin();
      const resolveId = getResolveId(plugin);

      const result = resolveId(
        './SimpleComponent.php@render',
        resolve(FIXTURES, 'some-story.ts'),
      );

      expect(result).toContain(VIRTUAL_PREFIX);
      expect(result).toContain('SimpleComponent.php');
      expect(result).toContain('callable=render');
    });

    it('uses defaultMethod from options when @method is omitted', () => {
      const plugin = storybookPhpPlugin({ defaultMethod: 'render' });
      const resolveId = getResolveId(plugin);

      const result = resolveId(
        './SimpleComponent.php',
        resolve(FIXTURES, 'some-story.ts'),
      );

      expect(result).toContain(VIRTUAL_PREFIX);
      expect(result).toContain('callable=render');
    });

    it('resolves to template mode when no @method and no defaultMethod', () => {
      const plugin = storybookPhpPlugin();
      const resolveId = getResolveId(plugin);

      const result = resolveId(
        './TemplateFile.php',
        resolve(FIXTURES, 'some-story.ts'),
      );

      expect(result).toContain(VIRTUAL_PREFIX);
      expect(result).toContain('callable=');
      // The callable should be empty (template mode)
      expect(result).toMatch(/callable=$/);
    });

    it('returns null for non-PHP files', () => {
      const plugin = storybookPhpPlugin();
      const resolveId = getResolveId(plugin);

      expect(resolveId('./Component.tsx', '/some/importer.ts')).toBeNull();
      expect(resolveId('./styles.css', '/some/importer.ts')).toBeNull();
      expect(resolveId('react', '/some/importer.ts')).toBeNull();
    });

    it('resolves absolute PHP path', () => {
      const plugin = storybookPhpPlugin();
      const resolveId = getResolveId(plugin);

      const absPath = resolve(FIXTURES, 'SimpleComponent.php');
      const result = resolveId(`${absPath}@render`);

      expect(result).toContain(VIRTUAL_PREFIX);
      expect(result).toContain(absPath);
      expect(result).toContain('callable=render');
    });

    it('returns null for relative PHP path without importer', () => {
      const plugin = storybookPhpPlugin();
      const resolveId = getResolveId(plugin);

      const result = resolveId('./SimpleComponent.php@render');
      expect(result).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // load tests
  // -----------------------------------------------------------------------
  describe('load', () => {
    it('returns null for non-virtual IDs', () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      expect(load('/some/regular/file.ts')).toBeNull();
      expect(load('react')).toBeNull();
    });

    it('generates classMethod module for SimpleComponent@render', () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, 'SimpleComponent.php');
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=render`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'classMethod'");
      expect(code).toContain(`__file: ${JSON.stringify(filePath)}`);
      expect(code).toContain('__class: "App\\\\Components\\\\SimpleComponent"');
      expect(code).toContain('__callable: "render"');
      expect(code).toContain('__constructorArgs:');
      expect(code).toContain('__callableArgs:');
      expect(code).toContain('__allArgs:');
      // Constructor params
      expect(code).toContain('name:');
      expect(code).toContain('age:');
      expect(code).toContain('export const SimpleComponent');
    });

    it('generates staticMethod module for Alert@danger', () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, 'StaticMethods.php');
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=danger`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'staticMethod'");
      expect(code).toContain('__class: "App\\\\Components\\\\Alert"');
      expect(code).toContain('__callable: "danger"');
      expect(code).toContain('__constructorArgs: {}');
      // Static method params in callableArgs
      expect(code).toContain('message:');
      expect(code).toContain('dismissible:');
      expect(code).toContain('export const Alert');
    });

    it('generates function module for StandaloneFunctions@badge', () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, 'StandaloneFunctions.php');
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=badge`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'function'");
      expect(code).toContain('__class: null');
      expect(code).toContain('__callable: "badge"');
      expect(code).toContain('__constructorArgs: {}');
      // Function params
      expect(code).toContain('label:');
      expect(code).toContain('color:');
      expect(code).toContain('export const badge');
    });

    it('generates enumMethod module for EnumComponent@badge', () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, 'EnumComponent.php');
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=badge`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'enumMethod'");
      expect(code).toContain('__class: "App\\\\Components\\\\Color"');
      expect(code).toContain('__callable: "badge"');
      // Should have _case in allArgs
      expect(code).toContain('_case:');
      expect(code).toContain('export const Color');
    });

    it('generates template module when callable is empty', () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, 'TemplateFile.php');
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain("__type: 'template'");
      expect(code).toContain('__class: null');
      expect(code).toContain('__callable: null');
      expect(code).toContain('__constructorArgs: {}');
      expect(code).toContain('__callableArgs: {}');
      expect(code).toContain('__allArgs: {}');
      expect(code).toContain('export default');
    });

    it('generates error module when callable not found', () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, 'SimpleComponent.php');
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=nonExistent`;
      const code = load(virtualId);

      expect(code).toBeTruthy();
      expect(code).toContain('throw new Error');
      expect(code).toContain('nonExistent');
    });

    it('includes default value in arg map when present', () => {
      const plugin = storybookPhpPlugin();
      const load = getLoad(plugin);

      const filePath = resolve(FIXTURES, 'SimpleComponent.php');
      const virtualId = `${VIRTUAL_PREFIX}${filePath}?callable=render`;
      const code = load(virtualId)!;

      // The age param has a default of '25'
      expect(code).toContain("default: \"25\"");
      // The name param should be required, no default
      expect(code).toContain("name: { type: 'string', required: true, position: 0, nullable: false }");
    });
  });

  // -----------------------------------------------------------------------
  // configureServer test
  // -----------------------------------------------------------------------
  describe('configureServer', () => {
    it('adds middleware to server', () => {
      const plugin = storybookPhpPlugin();
      const configureServer = (plugin as any).configureServer as (server: any) => void;

      const mockUse = vi.fn();
      const mockServer = {
        middlewares: {
          use: mockUse,
        },
      };

      configureServer(mockServer);
      expect(mockUse).toHaveBeenCalledTimes(1);
      expect(typeof mockUse.mock.calls[0][0]).toBe('function');
    });
  });
});
