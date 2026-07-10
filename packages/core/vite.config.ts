import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
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
      external: [/^react($|\/)/, /^react-dom($|\/)/],
    },
  },
});
