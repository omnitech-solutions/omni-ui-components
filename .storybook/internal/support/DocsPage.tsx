import * as React from 'react';
import { Controls, Description, Primary, Stories, Title, useOf } from '@storybook/addon-docs/blocks';
import { resolveDocsHeroPreset, type DocsHeroSegmentOverride } from './docsHero';
import { InlineCode } from './InlineCode';
import { SignatureCode } from './SignatureCode';
import { SegmentedPill } from './SegmentedPill';

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
  if (section === 'Getting Started') return `${name} reference, usage guidance, and implementation notes.`;
  if (section.includes('dynamic-form')) return `${name} schema-driven behavior, supported options, and authored examples.`;
  return `${name} usage guidance, supported props, and representative states.`;
};

const renderCodeAwareText = (value: React.ReactNode) => {
  if (typeof value !== 'string') return value;
  const segments = value.split(/(`[^`]+`|<primary>.*?<\/primary>|<code>.*?<\/code>)/g);
  return segments.map((segment, segmentIndex) => {
    if (segment.startsWith('`') && segment.endsWith('`')) {
      return <InlineCode key={segmentIndex} code={segment.slice(1, -1)} />;
    }

    if (segment.startsWith('<code>') && segment.endsWith('</code>')) {
      return <SignatureCode key={segmentIndex} code={segment.slice('<code>'.length, -'</code>'.length)} />;
    }

    if (segment.startsWith('<primary>') && segment.endsWith('</primary>')) {
      return (
        <span
          key={segmentIndex}
          className="font-medium text-[color:color-mix(in_srgb,var(--color-primary)_72%,var(--color-foreground)_28%)]"
        >
          {segment.slice('<primary>'.length, -'</primary>'.length)}
        </span>
      );
    }

    return <React.Fragment key={segmentIndex}>{segment}</React.Fragment>;
  });
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
  color: 'var(--color-primary)',
};

const apiEmptyCell: React.CSSProperties = {
  ...apiCellBase,
  color: 'var(--color-muted-foreground)',
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
      if (a.category && b.category && a.category !== b.category) return a.category.localeCompare(b.category);
      if (a.required !== b.required) return a.required ? -1 : 1;
      return a.prop.localeCompare(b.prop);
    });
}

export const DocsPage: React.FC = () => {
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
          propsReference?: ApiSection[] | ApiRow[]; api?: ApiSection[] | ApiRow[];
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
  const configuredApi = resolved.preparedMeta?.parameters?.docs?.propsReference ?? resolved.preparedMeta?.parameters?.docs?.api;
  const apiSections: ApiSection[] = Array.isArray(configuredApi)
    ? configuredApi.length > 0 && 'rows' in configuredApi[0]
      ? (configuredApi as ApiSection[])
      : [{ title: 'Component props', rows: configuredApi as ApiRow[] }]
    : [{ title: 'Component props', rows: normalizeApiRows(resolved.preparedMeta?.argTypes) }];
  const hasPropsReference = apiSections.some((section) => section.rows.length > 0);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-8 md:px-8">
      <style>{`
        .omni-docs-api-wrap .pb-pill-inline-code {
          white-space: normal !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
        }
      `}</style>

      <section className="pb-shell-header rounded-[24px] border border-border bg-card px-6 py-6 shadow-sm md:px-8">
        <div className="flex flex-col items-start gap-10">
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
                content: typeof signature === 'string' ? <SignatureCode code={signature} /> : signature,
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
          <div className="docs-page-description max-w-4xl text-[15px] leading-8 text-muted-foreground">
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
        <div className="mb-4 text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground/75">Preview</div>
        <Primary />
      </section>

      {hasPropsReference ? (
        <section className="omni-docs-api-wrap rounded-[24px] border border-border bg-card px-6 py-6 shadow-sm md:px-8">
          <div className="mb-5 text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground/75">API</div>
          <div className="space-y-10">
            {apiSections
              .filter((section) => section.rows.length > 0)
              .map((section) => (
                <section key={section.title ?? 'api-section'} className="space-y-3">
                  {section.title ? <h3 className="text-sm font-semibold text-foreground">{section.title}</h3> : null}
                  {section.description ? <div className="max-w-3xl text-sm leading-6 text-muted-foreground">{renderCodeAwareText(section.description)}</div> : null}
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
                              <InlineCode code={row.prop} className="text-xs text-[var(--color-primary)]" />
                              {row.required ? ' *' : ''}
                            </td>
                            <td style={apiCellBase}>{row.description}</td>
                            <td style={apiCellBase}>
                              <InlineCode code={row.type} className="text-xs text-[var(--color-foreground)]" />
                            </td>
                            {row.default && row.default !== '—' ? (
                              <td style={apiCellBase}>
                                <InlineCode code={row.default} className="text-xs text-[var(--color-foreground)]" />
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
        <div className="mb-4 text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground/75">Playground</div>
        <Controls />
      </section>

      <section className="rounded-[24px] border border-border bg-card px-6 py-6 shadow-sm md:px-8">
        <div className="mb-4 text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground/75">Variants</div>
        <Stories includePrimary={false} />
      </section>
    </div>
  );
};
