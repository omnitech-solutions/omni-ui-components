import { Controls, DocsContext, Story, useOf } from '@storybook/addon-docs/blocks';
import * as React from 'react';
import { renderCodeAwareText } from './codeAwareText';
import { type DocsHeroSegmentOverride, resolveDocsHeroPreset } from './docsHero';
import { ExampleFrame, type ExampleLayout } from './ExampleFrame';
import { resolveExampleCode, useExampleRecord } from './exampleStore';
import { InlineCode } from './InlineCode';
import { listenForRenderedSource } from './renderedSource';
import { SegmentedPill } from './SegmentedPill';
import { SignatureCode } from './SignatureCode';

interface DocsArgType {
  name?: string;
  description?: string;
  type?: { name?: string; summary?: string; required?: boolean; value?: unknown };
  table?: {
    type?: { summary?: string; detail?: string };
    defaultValue?: { summary?: string; detail?: string };
    category?: string;
    disable?: boolean;
  };
  required?: boolean;
}

interface ApiRow {
  prop: string;
  description: string;
  type: string;
  default?: string;
  required?: boolean;
}

interface ApiSection {
  title?: string;
  description?: React.ReactNode;
  rows: ApiRow[];
}

const splitTitle = (title: string | undefined) => {
  if (!title) return { section: 'Components', name: 'Component' };
  const parts = title.split('/').filter(Boolean);
  const name = parts.at(-1) ?? 'Component';
  const section = parts.slice(0, -1).join(' / ') || 'Components';
  return { section, name };
};

const inferSummary = (title: string | undefined) => {
  const { name, section } = splitTitle(title);
  if (section === 'Getting Started')
    return `${name} reference, usage guidance, and implementation notes.`;
  if (section.includes('dynamic-form'))
    return `${name} schema-driven behavior, supported options, and authored examples.`;
  return `${name} usage guidance, supported props, and representative states.`;
};

const apiTableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
  lineHeight: 1.55,
  tableLayout: 'fixed',
};

const apiCellBase: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid var(--color-border)',
  verticalAlign: 'top',
  textAlign: 'left',
};

const apiHeaderCell: React.CSSProperties = {
  ...apiCellBase,
  background: 'var(--color-muted, rgba(255,255,255,0.04))',
  fontWeight: 600,
};

const apiPropCell: React.CSSProperties = {
  ...apiCellBase,
  fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  fontSize: 12.5,
  overflowWrap: 'anywhere',
  color: 'var(--pb-chrome-accent)',
};

const apiEmptyCell: React.CSSProperties = {
  ...apiCellBase,
  color: 'var(--pb-chrome-muted)',
};

function summarizeType(argType: DocsArgType): string {
  return argType.table?.type?.summary || argType.type?.summary || argType.type?.name || '—';
}

function summarizeDefault(argType: DocsArgType): string {
  return argType.table?.defaultValue?.summary || '—';
}

function normalizeApiRows(argTypes: Record<string, unknown> | undefined) {
  return Object.entries(argTypes ?? {})
    .map(([prop, raw]) => {
      const argType = raw as DocsArgType;
      if (argType.table?.disable) return null;
      return {
        prop,
        description: argType.description?.trim() || '—',
        type: summarizeType(argType),
        defaultValue: summarizeDefault(argType),
        required: Boolean(argType.required || argType.type?.required),
        category: argType.table?.category || '',
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .sort((a, b) => {
      if (a.category && b.category && a.category !== b.category)
        return a.category.localeCompare(b.category);
      if (a.required !== b.required) return a.required ? -1 : 1;
      return a.prop.localeCompare(b.prop);
    });
}

interface DocsStory {
  id: string;
  name: string;
  moduleExport: unknown;
  tags?: string[];
  usesMount?: boolean;
  parameters?: {
    layout?: ExampleLayout;
    example?: { frame?: boolean };
    docs?: { description?: { story?: string }; source?: { code?: string } };
  };
}

/** The stories a docs page lists, as Storybook's own `Stories` block chooses them. */
const useDocsStories = (): DocsStory[] => {
  const context = React.useContext(DocsContext) as unknown as {
    componentStories: () => DocsStory[];
    getStoryContext: (story: DocsStory) => unknown;
    projectAnnotations: {
      parameters?: {
        docs?: { stories?: { filter?: (story: DocsStory, context: unknown) => boolean } };
      };
    };
  };
  let stories = context.componentStories();
  const filter = context.projectAnnotations.parameters?.docs?.stories?.filter;
  if (filter) stories = stories.filter((story) => filter(story, context.getStoryContext(story)));
  if (stories.some((story) => story.tags?.includes('autodocs')))
    stories = stories.filter((story) => story.tags?.includes('autodocs') && !story.usesMount);
  return stories;
};

/** One story of the page in the shared frame: the live story, and its code behind the one code bar. */
const DocsExample: React.FC<{ story: DocsStory; primary?: boolean }> = ({ story, primary }) => {
  const record = useExampleRecord(story.id);
  const anchor = `anchor--${primary ? 'primary--' : ''}${story.id}`;
  const live = (
    <Story of={story.moduleExport as never} __primary={primary} __forceInitialArgs={!primary} />
  );
  // A story that is a page of its own (`example.frame: false`) is drawn as it is: it frames itself.
  if (story.parameters?.example?.frame === false)
    return (
      <div id={anchor} className="scroll-mt-6 min-w-0 overflow-x-auto">
        {live}
      </div>
    );
  return (
    <ExampleFrame
      // The id Storybook scrolls to when the story is chosen in the sidebar.
      id={anchor}
      className="scroll-mt-6"
      title={primary ? undefined : (record.title ?? story.name)}
      description={
        primary
          ? undefined
          : renderCodeAwareText(record.description ?? story.parameters?.docs?.description?.story)
      }
      code={resolveExampleCode(record, story.parameters)}
      layout={story.parameters?.layout ?? 'padded'}
      // A variant is mounted when it comes near the window: a page of many stories opens as fast as one of few.
      defer={!primary}
      deferHeight={160}
    >
      {live}
    </ExampleFrame>
  );
};

export const DocsPage: React.FC = () => {
  listenForRenderedSource();
  const stories = useDocsStories();
  const [primaryStory, ...variants] = stories;
  const resolved = useOf('meta', ['meta']) as {
    preparedMeta?: {
      title?: string;
      parameters?: {
        docs?: {
          description?: { component?: string };
          signature?: React.ReactNode;
          heroPillClassName?: string;
          heroNameSegment?: DocsHeroSegmentOverride;
          heroSignatureSegment?: DocsHeroSegmentOverride;
          propsReference?: ApiSection[] | ApiRow[];
          api?: ApiSection[] | ApiRow[];
        };
      };
      argTypes?: Record<string, unknown>;
    };
  };

  const title = resolved.preparedMeta?.title;
  const { name } = splitTitle(title);
  const description = resolved.preparedMeta?.parameters?.docs?.description?.component;
  const hasDescription = typeof description === 'string' && description.trim().length > 0;
  const signature = resolved.preparedMeta?.parameters?.docs?.signature ?? `<${name} />`;
  const heroPreset = resolveDocsHeroPreset({
    heroPillClassName: resolved.preparedMeta?.parameters?.docs?.heroPillClassName,
    heroNameSegment: resolved.preparedMeta?.parameters?.docs?.heroNameSegment,
    heroSignatureSegment: resolved.preparedMeta?.parameters?.docs?.heroSignatureSegment,
  });
  const configuredApi =
    resolved.preparedMeta?.parameters?.docs?.propsReference ??
    resolved.preparedMeta?.parameters?.docs?.api;
  const apiSections: ApiSection[] = Array.isArray(configuredApi)
    ? configuredApi.length > 0 && 'rows' in configuredApi[0]
      ? (configuredApi as ApiSection[])
      : [{ title: 'Component props', rows: configuredApi as ApiRow[] }]
    : [{ title: 'Component props', rows: normalizeApiRows(resolved.preparedMeta?.argTypes) }];
  const hasPropsReference = apiSections.some((section) => section.rows.length > 0);

  return (
    <div className="omni-docs-page mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-8 md:px-8">
      <style>{`
        /* The library ships no CSS reset: without this the page is its padding wider than the window. */
        .omni-docs-page, .omni-docs-page > section { box-sizing: border-box; min-width: 0; max-width: 100%; }
        .omni-docs-page { max-width: min(72rem, 100%); margin-inline: auto !important; }
        .omni-docs-api-wrap table { min-width: 44rem; }
        .omni-docs-label { margin: 0 0 1rem !important; }
        /* A long inline signature in the description wraps: it must not widen the page. */
        .omni-docs-page .docs-page-description { min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
        .omni-docs-page .docs-page-description .pb-pill-inline-code { white-space: normal; }
        .omni-docs-api-wrap .pb-pill-inline-code {
          white-space: normal !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
        }
      `}</style>

      <section className="pb-shell-header rounded-[24px] border border-border bg-card px-6 py-6 shadow-sm md:px-8">
        <div className="flex flex-col items-start gap-10">
          {/* A long signature scrolls in its own box: the page stays as wide as the window. */}
          <div className="max-w-full overflow-x-auto">
            <SegmentedPill
              className={[
                'inline-flex items-stretch overflow-hidden rounded-[14px] border border-[color:color-mix(in_srgb,var(--oui-border-field)_82%,white_18%)] bg-[color:color-mix(in_srgb,var(--color-background)_94%,white_6%)] text-[9px] font-mono shadow-[0_14px_34px_rgba(0,0,0,0.22)]',
                heroPreset.heroPillClassName,
              ]
                .filter(Boolean)
                .join(' ')}
              segments={[
                {
                  content: name,
                  uppercase: true,
                  className: [
                    'px-3 py-1.5 text-[0.5rem] font-semibold tracking-[0.22em] text-foreground',
                    heroPreset.heroNameSegment.className ?? '',
                  ]
                    .filter(Boolean)
                    .join(' '),
                  style: heroPreset.heroNameSegment.style,
                },
                {
                  content:
                    typeof signature === 'string' ? <SignatureCode code={signature} /> : signature,
                  className: [
                    'px-3 py-1.5 bg-[color:color-mix(in_srgb,var(--color-background)_82%,white_18%)]',
                    heroPreset.heroSignatureSegment.className ?? '',
                  ]
                    .filter(Boolean)
                    .join(' '),
                  style: heroPreset.heroSignatureSegment.style,
                },
              ]}
            />
          </div>
          <div className="docs-page-description max-w-4xl text-[15px] leading-8 pb-muted">
            {hasDescription ? (
              <div className="[&>p]:m-0 [&>p]:text-[15px] [&>p]:leading-8 [&>p]:tracking-[0.01em]">
                {renderCodeAwareText(description)}
              </div>
            ) : (
              <p className="m-0 tracking-[0.01em]">{renderCodeAwareText(inferSummary(title))}</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-border bg-card px-6 py-6 shadow-sm md:px-8">
        <div className="omni-docs-label text-[11px] font-mono uppercase tracking-[0.28em] pb-muted">
          Preview
        </div>
        {primaryStory ? <DocsExample story={primaryStory} primary /> : null}
      </section>

      {hasPropsReference ? (
        <section className="omni-docs-api-wrap rounded-[24px] border border-border bg-card px-6 py-6 shadow-sm md:px-8">
          <div className="omni-docs-label text-[11px] font-mono uppercase tracking-[0.28em] pb-muted">
            API
          </div>
          <div className="space-y-10">
            {apiSections
              .filter((section) => section.rows.length > 0)
              .map((section) => (
                <section key={section.title ?? 'api-section'} className="space-y-3">
                  {section.title ? (
                    <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                  ) : null}
                  {section.description ? (
                    <div className="max-w-3xl text-sm leading-6 pb-muted">
                      {renderCodeAwareText(section.description)}
                    </div>
                  ) : null}
                  <div className="overflow-x-auto">
                    <table style={apiTableStyle}>
                      <colgroup>
                        <col style={{ width: 220 }} />
                        <col />
                        <col style={{ width: 240 }} />
                        <col style={{ width: 180 }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th style={apiHeaderCell}>Property</th>
                          <th style={apiHeaderCell}>Description</th>
                          <th style={apiHeaderCell}>Type</th>
                          <th style={apiHeaderCell}>Default</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.rows.map((row) => (
                          <tr key={row.prop}>
                            <td style={apiPropCell}>
                              <InlineCode code={row.prop} className="text-xs pb-accent" />
                              {row.required ? ' *' : ''}
                            </td>
                            <td style={apiCellBase}>{row.description}</td>
                            <td style={apiCellBase}>
                              <InlineCode
                                code={row.type}
                                className="text-xs text-[var(--color-foreground)]"
                              />
                            </td>
                            {row.default && row.default !== '—' ? (
                              <td style={apiCellBase}>
                                <InlineCode
                                  code={row.default}
                                  className="text-xs text-[var(--color-foreground)]"
                                />
                              </td>
                            ) : (
                              <td style={apiEmptyCell}>—</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[24px] border border-border bg-card px-6 py-6 shadow-sm md:px-8">
        <div className="omni-docs-label text-[11px] font-mono uppercase tracking-[0.28em] pb-muted">
          Playground
        </div>
        {/* The controls table keeps its own width and scrolls in its box at a narrow window. */}
        <div className="overflow-x-auto">
          <Controls />
        </div>
      </section>

      {variants.length > 0 ? (
        <section className="rounded-[24px] border border-border bg-card px-6 py-6 shadow-sm md:px-8">
          <div className="omni-docs-label text-[11px] font-mono uppercase tracking-[0.28em] pb-muted">
            Variants
          </div>
          <div className="flex flex-col gap-10">
            {variants.map((story) => (
              <DocsExample key={story.id} story={story} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};
