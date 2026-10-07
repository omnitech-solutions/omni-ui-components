import path from 'node:path';
import { defineConfig, mergeConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import viteConfig from './vite.config';

// Runs every story's `play` function in real Chromium (see `pnpm test:stories`).
// Kept apart from vitest.config.ts so `pnpm test` (happy-dom unit tests) is unchanged.
export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [
      storybookTest({
        configDir: path.join(import.meta.dirname, '.storybook'),
        storybookScript: 'pnpm storybook -p 6141 --ci',
      }),
    ],
    test: {
      name: 'storybook',
      include: [],
      browser: {
        enabled: true,
        headless: true,
        provider: playwright(),
        instances: [{ browser: 'chromium' }],
      },
      setupFiles: ['./.storybook/vitest.setup.ts'],
    },
  }),
);
