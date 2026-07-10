import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const coreSrc = path.join(repoRoot, 'packages', 'core', 'src');

const config: StorybookConfig = {
  framework: { name: '@storybook/react-vite', options: {} },
  stories: ['../.storybook/**/*.@(story|stories).@(ts|tsx)', '../packages/core/src/**/*.@(story|stories).@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  core: { disableTelemetry: true },
  features: { backgrounds: false },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@omnitech/omni-ui-core/dynamic-form/': path.join(coreSrc, 'dynamic-form') + path.sep,
      '@omnitech/omni-ui-core/dynamic-form': path.join(coreSrc, 'dynamic-form', 'index.ts'),
      '@omnitech/omni-ui-core/': coreSrc + path.sep,
      '@omnitech/omni-ui-core': path.join(coreSrc, 'index.ts'),
      'dynamic-form/': path.join(coreSrc, 'dynamic-form') + path.sep,
      'dynamic-form': path.join(coreSrc, 'dynamic-form', 'index.ts'),
      components: path.join(coreSrc, 'components'),
      lib: path.join(coreSrc, 'lib'),
      'factories/omni-ui-components': coreSrc,
      'factories/dynamic-form': path.join(coreSrc, 'dynamic-form'),
      'factories/lib/dynamic-form': path.join(coreSrc, 'dynamic-form'),
      'storybook-helpers': path.resolve(repoRoot, '.storybook'),
    };
    return config;
  },
};

export default config;
