import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { defineConfig } from 'vite';
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

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    react(),
    tailwindcss(),
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
