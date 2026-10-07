import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Bundles host page B against the BUILT package (dist), exactly as a consumer would. Page A is static HTML.
const core = resolve(__dirname, '../..');

export default defineConfig({
  root: __dirname,
  logLevel: 'warn',
  resolve: {
    alias: [
      { find: '@oc-tech/omni-ui-components/styles.css', replacement: resolve(core, 'dist/styles.css') },
      { find: '@oc-tech/omni-ui-components', replacement: resolve(core, 'dist/index.js') },
    ],
  },
  esbuild: { jsx: 'automatic' },
  build: {
    outDir: resolve(core, 'tmp/host-app'),
    emptyOutDir: true,
    rollupOptions: { input: { b: resolve(__dirname, 'b.html'), c: resolve(__dirname, 'c.html'), d: resolve(__dirname, 'd.html') } },
  },
});
