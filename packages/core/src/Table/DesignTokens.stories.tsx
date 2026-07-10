import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InlineCode, SegmentedPill, TableOfContents, type TocItem } from './storySupport';
import { looksLikeColor, readCssTokens, resolveCssVar, type CssToken } from '../../../../.storybook/internal/support/readCssTokens';
interface TokenSection {
  id: string;
  key: string;
  title: string;
  description: string;
  tokens: CssToken[];
}

interface TokenGroupDefinition {
  key: string;
  title: string;
  description: string;
  match: (normalizedName: string) => boolean;
  order: number;
}

const TOKEN_GROUPS: TokenGroupDefinition[] = [
  {
    key: 'surface',
    title: 'Surface and shell',
    description: 'Root table container tokens for panel background, foreground, borders, radius, and shell-level structure.',
    match: (name) => /^(bg|fg|muted-fg|border|border-strong|radius)$/.test(name),
    order: 0,
  },
  {
    key: 'header',
    title: 'Header',
    description: 'Header row tokens for fill, text, split borders, and sort/filter interactive states.',
    match: (name) => name.startsWith('header-'),
    order: 1,
  },
  {
    key: 'rows',
    title: 'Rows and states',
    description: 'Row-level tokens for hover, selected, expanded, striped, footer, and scroll-state treatment.',
    match: (name) => name.startsWith('row-') || name.startsWith('footer-') || name.startsWith('sticky-scrollbar-'),
    order: 2,
  },
  {
    key: 'cell',
    title: 'Cell spacing and type',
    description: 'Cell typography, line-height, and spacing scales used by the Table size variants.',
    match: (name) => name.startsWith('cell-'),
    order: 3,
  },
  {
    key: 'controls',
    title: 'Controls and overlays',
    description: 'Tokens for filter menus, expand cells, selection width, focus, and state feedback tied to interactive table controls.',
    match: (name) =>
      name.startsWith('filter-') || name.startsWith('expand-') || name.startsWith('selection-') || name.startsWith('focus-') || name.startsWith('error-'),
    order: 4,
  },
  {
    key: 'drag',
    title: 'Drag reorder handle',
    description: 'Dedicated drag-handle tokens for row and column reorder affordances.',
    match: (name) => name.startsWith('drag-handle-'),
    order: 5,
  },
  {
    key: 'motion',
    title: 'Motion',
    description: 'Table-specific transition and timing tokens used for interactive states.',
    match: (name) => name.startsWith('transition-'),
    order: 6,
  },
];

const DEFAULT_GROUP: TokenGroupDefinition = {
  key: 'misc',
  title: 'Miscellaneous',
  description: 'Table-owned tokens that do not match one of the primary families yet. New token families land here automatically until promoted.',
  match: () => true,
  order: 99,
};

const familyForToken = (token: CssToken): 'color' | 'dimension' | 'other' => {
  if (looksLikeColor(token.value)) return 'color';
  if (/(px|rem|em|%|ms|s|cubic-bezier|\d(\.\d+)?$)/.test(token.value)) return 'dimension';
  return 'other';
};

const normalizedTokenName = (name: string) => name.replace(/^--bui-table-/, '');

const tokenGroupFor = (token: CssToken): TokenGroupDefinition => {
  const normalizedName = normalizedTokenName(token.name);
  return TOKEN_GROUPS.find((group) => group.match(normalizedName)) ?? DEFAULT_GROUP;
};

const resolveTokenValue = (value: string, map: Record<string, string>): string => {
  let current = value;
  const seen = new Set<string>();

  while (current.startsWith('var(') && !seen.has(current)) {
    seen.add(current);
    const match = current.match(/^var\((--[a-z0-9-]+)\)/i);
    if (!match) break;
    const next = map[match[1]];
    if (!next) break;
    current = next;
  }

  return current;
};

const previewForToken = (token: CssToken, valueMap: Record<string, string>) => {
  const family = familyForToken(token);
  const resolved = resolveTokenValue(token.value, valueMap) || resolveCssVar(token.name);

  if (family === 'color') {
    return <span aria-hidden="true" className="block size-10 rounded-md border border-border" style={{ background: resolved }} />;
  }

  if (token.name.includes('radius')) {
    return <span aria-hidden="true" className="block size-10 border border-border bg-emerald-500/20" style={{ borderRadius: `var(${token.name})` }} />;
  }

  if (token.name.includes('padding') || token.name.includes('width') || token.name.includes('size')) {
    return <span aria-hidden="true" className="block h-3 rounded-full bg-emerald-500/45" style={{ width: `min(var(${token.name}), 120px)` }} />;
  }

  if (token.name.includes('font-size')) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-background text-foreground"
        style={{ fontSize: `var(${token.name})` }}
      >
        Aa
      </span>
    );
  }

  if (token.name.includes('line-height')) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-background text-[12px] text-foreground"
        style={{ lineHeight: `var(${token.name})` }}
      >
        A
      </span>
    );
  }

  if (token.name.includes('shadow')) {
    return <span aria-hidden="true" className="block size-10 rounded-md bg-background" style={{ boxShadow: `var(${token.name})` }} />;
  }

  return (
    <span aria-hidden="true" className="inline-flex min-h-10 items-center rounded-md border border-border px-2 text-[11px] text-muted-foreground">
      {resolved}
    </span>
  );
};

const tokenLabel = (name: string) => name.replace('--bui-table-', '');

const TokenValue = ({ value }: { value: string }) => <code className="rounded bg-muted px-2 py-1 text-[11px] text-muted-foreground">{value}</code>;

const TokenRow = ({ token, valueMap }: { token: CssToken; valueMap: Record<string, string> }) => (
  <div className="grid grid-cols-[64px_minmax(0,1.1fr)_minmax(0,1.4fr)] items-center gap-4 border-b border-border/60 px-2 py-3 last:border-b-0">
    <div>{previewForToken(token, valueMap)}</div>
    <div className="min-w-0">
      <div className="truncate font-mono text-xs text-foreground">{token.name}</div>
      <div className="mt-1 text-xs text-muted-foreground">{tokenLabel(token.name)}</div>
    </div>
    <div className="min-w-0">
      <TokenValue value={token.value} />
    </div>
  </div>
);

const TokenSectionView = ({ section, tokens, valueMap }: { section: TokenSection; tokens: CssToken[]; valueMap: Record<string, string> }) => (
  <section id={section.id} className="pb-pipeline-section">
    <div className="mb-4">
      <SegmentedPill
        segments={[
          { content: section.title, uppercase: true },
          { content: `${tokens.length} tokens`, tinted: true },
        ]}
      />
      <p className="mt-3 text-sm text-muted-foreground">{section.description}</p>
    </div>

    <div className="rounded-lg border border-border bg-card">
      <div className="grid grid-cols-[64px_minmax(0,1.1fr)_minmax(0,1.4fr)] gap-4 border-b border-border/60 px-2 py-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <span>Preview</span>
        <span>Name</span>
        <span>Value</span>
      </div>
      {tokens.map((token) => (
        <TokenRow key={token.name} token={token} valueMap={valueMap} />
      ))}
    </div>
  </section>
);

const DesignTokensPage = () => {
  const [tokens, setTokens] = React.useState<CssToken[]>([]);

  React.useEffect(() => {
    const rootTokens = readCssTokens((selector) => selector === ':root');
    setTokens(rootTokens.filter((token) => token.name.startsWith('--bui-table-')));
  }, []);

  const valueMap = React.useMemo(() => Object.fromEntries(tokens.map((token) => [token.name, token.value])), [tokens]);
  const sections = React.useMemo(() => {
    const grouped = new Map<string, TokenSection>();

    tokens.forEach((token) => {
      const group = tokenGroupFor(token);
      const existing = grouped.get(group.key);

      if (existing) {
        existing.tokens.push(token);
        return;
      }

      grouped.set(group.key, {
        id: `table-tokens-${group.key}`,
        key: group.key,
        title: group.title,
        description: group.description,
        tokens: [token],
      });
    });

    return Array.from(grouped.values())
      .map((section) => ({
        ...section,
        tokens: [...section.tokens].sort((left, right) => left.name.localeCompare(right.name)),
      }))
      .sort((left, right) => {
        const leftOrder = (TOKEN_GROUPS.find((group) => group.key === left.key) ?? DEFAULT_GROUP).order;
        const rightOrder = (TOKEN_GROUPS.find((group) => group.key === right.key) ?? DEFAULT_GROUP).order;
        if (leftOrder !== rightOrder) return leftOrder - rightOrder;
        return left.title.localeCompare(right.title);
      });
  }, [tokens]);

  const tocItems: TocItem[] = sections.map((section) => ({
    id: section.id,
    label: section.title,
    group: 'Table tokens',
  }));

  return (
    <div className="pb-shell">
      <div className="pb-shell-header">
        <h2>
          Design Tokens
          <SegmentedPill
            segments={[
              { content: 'Omni UI', uppercase: true },
              { content: '<Table />', tinted: true },
            ]}
          />
        </h2>
        <p>Table-specific tokens only. This page excludes shared theme variables and shows the local token surface owned by the Table component.</p>
      </div>

      <div className="pb-overview-layout">
        <main className="pb-overview-main">
          <section id="table-tokens-scope" className="pb-pipeline-section">
            <h3 className="pb-pipeline-section-title">Scope</h3>
            <p>
              Tokens are read directly from <InlineCode code="Table.tokens.css" /> and filtered to <InlineCode code="--bui-table-*" /> variables. Shared aliases
              from the Omni core theme remain referenced in values, but they are intentionally not listed here.
            </p>
          </section>

          {sections.map((section) => (
            <TokenSectionView key={section.id} section={section} tokens={section.tokens} valueMap={valueMap} />
          ))}
        </main>

        <TableOfContents items={[{ id: 'table-tokens-scope', label: 'Scope', group: 'Table tokens' }, ...tocItems]} />
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'omni-ui-components/Table/Design Tokens',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Design token reference for the shared Omni Table component. This story lists only tokens defined in Table.tokens.css and excludes shared app-level theme tokens.',
      },
    },
  },
};

export default meta;

export const DesignTokens: StoryObj = {
  render: () => <DesignTokensPage />,
};
