import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: import.meta.dirname,
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  resolve: {
    alias: {
      '@omnitech/omni-ui-core/dynamic-form/': `${import.meta.dirname}/packages/core/src/dynamic-form/`,
      '@omnitech/omni-ui-core/dynamic-form': `${import.meta.dirname}/packages/core/src/dynamic-form/index.ts`,
      '@omnitech/omni-ui-core/': `${import.meta.dirname}/packages/core/src/`,
      '@omnitech/omni-ui-core': `${import.meta.dirname}/packages/core/src/index.ts`,
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
  },
});
