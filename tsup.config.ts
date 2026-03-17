import { defineConfig } from 'tsup';

export default defineConfig({
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
  external: ['storybook', 'vite', 'typescript'],
  splitting: true,
});
