import path from 'node:path';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Screenshot baselines for the Native App showcase (see `pnpm test:visual`, `pnpm test:visual:update`).
// Separate from vitest.storybook.config.ts: that one runs `play` functions, this one compares pixels.
// Baselines are suffixed by browser and platform (`...-chromium-darwin.png`), so macOS and Linux never compare
// against each other. CI (ubuntu-24.04) runs this config against the committed `-linux` baselines.
export default mergeConfig(
  viteConfig,
  defineConfig({
    // The set-up file imports the a11y addon's preview: named here so Vite does not find it mid-run and reload.
    optimizeDeps: { include: ['@storybook/addon-a11y/preview'] },
    test: {
      name: 'visual',
      include: ['visual/**/*.visual.test.tsx'],
      setupFiles: ['./.storybook/vitest.setup.ts'],
      browser: {
        enabled: true,
        headless: true,
        provider: playwright(),
        // One pinned viewport and device scale factor for every capture.
        viewport: { width: 1280, height: 900 },
        instances: [
          { browser: 'chromium', context: { deviceScaleFactor: 1, reducedMotion: 'reduce' } },
        ],
        expect: {
          toMatchScreenshot: {
            comparatorName: 'pixelmatch',
            comparatorOptions: { threshold: 0.2, allowedMismatchedPixelRatio: 0.002 },
            resolveScreenshotPath: ({ arg, browserName, platform, root }) =>
              path.join(root, 'visual', '__screenshots__', `${arg}-${browserName}-${platform}.png`),
          },
        },
      },
    },
  }),
);
