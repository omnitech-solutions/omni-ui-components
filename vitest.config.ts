import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@oc-tech/omni-ui-components/dynamic-form/': `${import.meta.dirname}/packages/core/src/dynamic-form/`,
      '@oc-tech/omni-ui-components/dynamic-form': `${import.meta.dirname}/packages/core/src/dynamic-form/index.ts`,
      '@oc-tech/omni-ui-components/': `${import.meta.dirname}/packages/core/src/`,
      '@oc-tech/omni-ui-components': `${import.meta.dirname}/packages/core/src/index.ts`,
      'dynamic-form/': `${import.meta.dirname}/packages/core/src/dynamic-form/`,
      'dynamic-form': `${import.meta.dirname}/packages/core/src/dynamic-form/index.ts`,
      'factories/omni-ui-components': `${import.meta.dirname}/packages/core/src`,
      'factories/dynamic-form': `${import.meta.dirname}/packages/core/src/dynamic-form`,
      'storybook-helpers': `${import.meta.dirname}/.storybook`,
    },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['packages/**/*.test.{ts,tsx}'],
    css: true,
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['packages/core/src/**/*.{ts,tsx}', 'packages/core/helpers/**/*.{ts,tsx}'],
      // Only code that has no behaviour of its own: stories run in `test:storybook`, factories are demo data,
      // barrels only re-export, declarations have no runtime code, the showcase is the demo app.
      exclude: [
        '**/*.stories.{ts,tsx}',
        '**/*.factories.{ts,tsx}',
        '**/*.fixtures.{ts,tsx}',
        '**/index.ts',
        '**/*.d.ts',
        '**/showcase/**',
        '**/test/**',
        '**/*.test.{ts,tsx}',
      ],
      // thresholds (80 on lines, statements, branches and functions) are switched on once src/Table has tests: see U46.
    },
  },
});
