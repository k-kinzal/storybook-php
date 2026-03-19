import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { vis } from 'vitest-plugin-vis/config';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    storybookTest({ configDir: '.storybook' }),
    vis({ comparisonMethod: 'pixel' }),
  ],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
});
