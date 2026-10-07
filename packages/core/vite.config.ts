import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import tailwindcss from '@tailwindcss/vite';

const require = createRequire(import.meta.url);
const packageJson = require('./package.json') as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
const externalPackages = [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
];

/**
 * Tailwind emits its `@property` fallback as a top-level `@layer properties`. Nest it under the library layer so every
 * layer the package ships is `omni-ui-components` or one of its sublayers (see bionic/research/references/css-delivery.md).
 */
const nestTailwindLayers = (): Plugin => ({
  name: 'oui:nest-tailwind-layers',
  enforce: 'post',
  generateBundle(_options, bundle) {
    for (const asset of Object.values(bundle)) {
      if (asset.type !== 'asset' || !asset.fileName.endsWith('.css') || typeof asset.source !== 'string') continue;
      asset.source = asset.source.replace(/@layer properties(?=[{;,])/g, '@layer omni-ui-components.properties');
    }
  },
});

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    nestTailwindLayers(),
    dts({
      entryRoot: 'src',
      outDir: 'dist-types',
      exclude: ['src/**/*.stories.*', 'src/**/*.factories.*', 'src/**/*.test.*', 'test/**'],
    }),
  ],
  build: {
    sourcemap: true,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'dynamic-form/index': resolve(__dirname, 'src/dynamic-form/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
      cssFileName: 'styles',
    },
    rollupOptions: {
      external: (id) =>
        externalPackages.some((packageName) => id === packageName || id.startsWith(`${packageName}/`)),
    },
  },
});
