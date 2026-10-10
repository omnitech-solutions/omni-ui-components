import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react';
import * as React from 'react';
import { themes } from 'storybook/theming';
import { a11yAllowances } from './a11yAllowances';
import { renderCodeAwareText } from './internal/support/codeAwareText';
import { componentNameOf } from './internal/support/componentName';
import { DocsPage } from './internal/support/DocsPage';
import { ExampleFrame, type ExampleLayout } from './internal/support/ExampleFrame';
import {
  ExampleStoryContext,
  resolveExampleCode,
  useExampleRecord,
} from './internal/support/exampleStore';
import { listenForRenderedSource } from './internal/support/renderedSource';

import '../packages/core/src/styles/base-palette.css';
import '../packages/core/src/styles/theme-tokens.css';
import '../packages/core/src/styles/tailwind.css';
import '../packages/core/src/styles/tokens.css';

type StoryParameters = {
  layout?: ExampleLayout;
  example?: { frame?: boolean };
  __isPortableStory?: boolean;
  docs?: { description?: { story?: string } };
};

/**
 * The story view. The frame (component name, story name, description, the code bar) is on by default and is
 * drawn around Storybook's root, never inside it. `parameters.example = { frame: false }` leaves a story the
 * whole window (the overview pages, full-page showcases); either way the story's `layout` places it.
 */
const StoryView: React.FC<{
  id: string;
  title: string;
  name: string;
  parameters: StoryParameters;
  canvas: HTMLElement;
  children: React.ReactNode;
}> = ({ id, title, name, parameters, canvas, children }) => {
  const record = useExampleRecord(id);
  const layout = parameters.layout ?? 'padded';
  // Only Storybook's own root is framed: a story mounted elsewhere (a test) is left as it is.
  const framed =
    parameters.example?.frame !== false &&
    !parameters.__isPortableStory &&
    canvas.id === 'storybook-root';
  React.useLayoutEffect(() => {
    if (framed || parameters.__isPortableStory) return;
    canvas.setAttribute('data-story-layout', layout);
    return () => canvas.removeAttribute('data-story-layout');
  }, [canvas, framed, layout, parameters.__isPortableStory]);
  if (!framed) return <>{children}</>;
  return (
    <ExampleFrame
      host={canvas}
      eyebrow={title.split('/').filter(Boolean).at(-1)}
      title={record.title ?? name}
      description={renderCodeAwareText(
        record.description ?? parameters.docs?.description?.story ?? undefined,
      )}
      code={resolveExampleCode(record, parameters)}
      layout={layout}
    >
      {children}
    </ExampleFrame>
  );
};

const preview: Preview = {
  globalTypes: {
    hitArea: {
      description: 'Outline the 40px hit area of control-row buttons',
      toolbar: {
        title: 'Hit area',
        icon: 'outline',
        items: [
          { value: 'off', title: 'Hit area: off' },
          { value: 'outline', title: 'Hit area: outline' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { hitArea: 'off' },
  parameters: {
    // Storybook's own default, stated: a story is placed by its `layout` (see `StoryView` and `ExampleFrame`).
    layout: 'padded',
    controls: {
      expanded: true,
      matchers: { color: /(background|color)$/i, date: /Date$/ },
    },
    docs: {
      theme: themes.dark,
      page: DocsPage,
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1A1C1D' },
        { name: 'light', value: '#ffffff' },
      ],
    },
    // The JSX printed from a story's args names components as they are imported (see `componentNameOf`).
    jsx: { displayName: (element: React.ReactElement) => componentNameOf(element.type) },
    // `config.rules` is the list of accepted exceptions, kept in one file: see `a11yAllowances.ts`.
    a11y: { test: 'error', config: { rules: a11yAllowances } },
    options: {
      storySort: {
        order: [
          'Getting Started',
          ['Component Overview', 'Table Overview'],
          'omni-ui-components',
          'dynamic-form',
        ],
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
      listenForRenderedSource();
      if (typeof document !== 'undefined') {
        if (ctx.globals.hitArea === 'outline')
          document.documentElement.setAttribute('data-oui-hit-outline', '');
        else document.documentElement.removeAttribute('data-oui-hit-outline');
      }
      const theme = String(ctx.globals.theme ?? 'dark').toLowerCase();
      if (typeof document !== 'undefined') {
        if (theme === 'light') document.documentElement.removeAttribute('data-theme');
        else document.documentElement.setAttribute('data-theme', 'dark');
      }
      const bg = theme === 'light' ? '#ffffff' : '#1A1C1D';
      const fg = 'var(--color-foreground)';
      const fontStack =
        "var(--font-sans, 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)";
      // A story composed outside Storybook (the screenshot tests mount one in an element they name
      // \`storybook-root\`) keeps the placement the baselines were taken with: centred, sized by its content.
      const portable = (ctx.parameters as { __isPortableStory?: boolean }).__isPortableStory
        ? '#storybook-root:not([hidden]) { padding: 3rem 2rem; min-height: 100vh; box-sizing: border-box; display: flex; align-items: flex-start; justify-content: center; }'
        : '';
      const css = `
        html, body { background: ${bg} !important; color: ${fg} !important; font-family: ${fontStack} !important; }
        #storybook-root[hidden] { display: none !important; }
        #storybook-root:not([hidden]), .sb-show-main {
          background: ${bg} !important; color: ${fg} !important; font-family: ${fontStack} !important;
        }
        ${portable}
        .docs-story, .docs-story #storybook-root { background: ${bg} !important; color: ${fg} !important; }
        .docs-story #storybook-root, .docs-story .sb-show-main { padding-top: 3rem !important; padding-bottom: 3rem !important; }
        .sbdocs-preview .docs-story { padding-top: 1rem; padding-bottom: 1rem; }
        .sbdocs.sbdocs-wrapper, .sbdocs.sbdocs-content, .sbdocs-preview {
          background: ${bg} !important; color: ${fg} !important;
        }
        .sbdocs.sbdocs-content, .sbdocs.sbdocs-content *:not(pre, code, pre *, code *, .pb-code-pre, .pb-code-pre *, .pb-example-eyebrow, .font-mono) { font-family: ${fontStack} !important; }
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
        <ExampleStoryContext.Provider value={ctx.id}>
          <style dangerouslySetInnerHTML={{ __html: css }} />
          {ctx.viewMode === 'story' && ctx.canvasElement ? (
            <StoryView
              id={ctx.id}
              title={ctx.title}
              name={ctx.name}
              parameters={ctx.parameters as StoryParameters}
              canvas={ctx.canvasElement}
            >
              <Story />
            </StoryView>
          ) : (
            <Story />
          )}
        </ExampleStoryContext.Provider>
      );
    },
  ],
};

export default preview;
