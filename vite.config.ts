import { defineConfig } from 'vite-plus/test/config';

export default defineConfig({
  pack: {
    entry: [
      'src/index.ts',
      'src/preset.ts',
      'src/preview.ts',
      'src/vite-plugin.ts',
      'src/cli.ts',
      'src/ts-plugin/index.ts',
    ],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'node20',
    deps: { neverBundle: ['storybook', 'vite', 'typescript'] },
    splitting: true,
  },
  test: {
    include: ['src/__tests__/**/*.test.ts'],
    environment: 'node',
    globals: true,
    testTimeout: 15000,
  },
});
