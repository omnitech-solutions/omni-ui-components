import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
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
});
