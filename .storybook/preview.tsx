import * as React from 'react';
import type { Preview } from '@storybook/react';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { themes } from 'storybook/theming';
import { DocsPage } from './internal/support';

import '../packages/core/src/styles/base-palette.css';
import '../packages/core/src/styles/theme-tokens.css';
import '../packages/core/src/styles/tailwind.css';
import '../packages/core/src/styles/tokens.css';

/**
 * Render `args` as JSX attributes in the docs "Show code" preview so the
 * autodocs source shows `<Input prop="value" />` instead of the renderer
 * wrapper from the `render` function. Mirrors feature/omni-ui-components.
 */
const formatArgs = (args: Record<string, unknown>): string => {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(args)) {
    if (v === undefined || k === 'error') continue;
    if (typeof v === 'string') {
      lines.push(`  ${k}="${v}"`);
    } else if (typeof v === 'boolean') {
      if (v) lines.push(`  ${k}`);
    } else if (typeof v === 'number') {
      lines.push(`  ${k}={${v}}`);
    } else if (typeof v === 'function') {
      lines.push(`  ${k}={() => {}}`);
    } else {
      lines.push(`  ${k}={${JSON.stringify(v, null, 2).replace(/\n/g, '\n  ')}}`);
    }
  }
  return lines.join('\n');
};

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: {
      expanded: true,
      matchers: { color: /(background|color)$/i, date: /Date$/ },
    },
    docs: {
      theme: themes.dark,
      page: DocsPage,
      source: {
        transform: (_code: string, ctx: { args?: Record<string, unknown>; component?: { displayName?: string; name?: string } }) => {
          const name = ctx.component?.displayName || ctx.component?.name || 'Component';
          const args = ctx.args ?? {};
          return `<${name}\n${formatArgs(args)}\n/>`;
        },
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1A1C1D' },
        { name: 'light', value: '#ffffff' },
      ],
    },
    a11y: { test: 'error' },
    options: {
      storySort: {
        order: ['Getting Started', ['Component Overview', 'Dynamic Form Overview', 'Table Overview', 'Design Tokens'], 'omni-ui-components', 'dynamic-form'],
      },
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { dark: 'dark', light: 'light' },
      defaultTheme: 'dark',
      attributeName: 'data-theme',
    }),
    (Story, ctx) => {
      const theme = String(ctx.globals.theme ?? 'dark').toLowerCase();
      if (typeof document !== 'undefined') {
        if (theme === 'light') document.documentElement.removeAttribute('data-theme');
        else document.documentElement.setAttribute('data-theme', 'dark');
      }
      const bg = theme === 'light' ? '#ffffff' : '#1A1C1D';
      const fg = 'var(--color-foreground)';
      const fontStack = "var(--font-sans, 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)";
      const css = `
        html, body { background: ${bg} !important; color: ${fg} !important; font-family: ${fontStack} !important; }
        #storybook-root[hidden] { display: none !important; }
        #storybook-root:not([hidden]), .sb-show-main {
          background: ${bg} !important; color: ${fg} !important; font-family: ${fontStack} !important;
          padding: 3rem 2rem; min-height: 100vh; box-sizing: border-box;
          display: flex; align-items: flex-start; justify-content: center;
        }
        .docs-story, .docs-story #storybook-root { background: ${bg} !important; color: ${fg} !important; }
        .docs-story #storybook-root, .docs-story .sb-show-main { padding-top: 3rem !important; padding-bottom: 3rem !important; }
        .sbdocs-preview .docs-story { padding-top: 1rem; padding-bottom: 1rem; }
        .sbdocs.sbdocs-wrapper, .sbdocs.sbdocs-content, .sbdocs-preview {
          background: ${bg} !important; color: ${fg} !important;
        }
        .sbdocs.sbdocs-content, .sbdocs.sbdocs-content * { font-family: ${fontStack} !important; }
        .sbdocs.sbdocs-content { max-width: 100% !important; }
        .sbdocs-wrapper { padding: 0 !important; }
        .sbdocs .sb-unstyled { color: ${fg} !important; }
        .docs-page-title h1, .docs-page-description p { margin: 0 !important; }
        .sbdocs .docblock-argstable,
        .sbdocs .docblock-source,
        .sbdocs .docblock-story,
        .sbdocs .docblock-code-toggle {
          border-radius: 10px !important;
        }
        .sbdocs .docblock-argstable {
          overflow: hidden;
          border: 1px solid color-mix(in srgb, ${fg} 12%, transparent) !important;
        }
        .sbdocs .docblock-source {
          border: 1px solid color-mix(in srgb, ${fg} 10%, transparent) !important;
          box-shadow: none !important;
        }
        .sbdocs .docblock-story {
          border: 1px solid color-mix(in srgb, ${fg} 10%, transparent) !important;
          box-shadow: none !important;
        }
      `;
      return (
        <>
          <style dangerouslySetInnerHTML={{ __html: css }} />
          <Story />
        </>
      );
    },
  ],
};

export default preview;
