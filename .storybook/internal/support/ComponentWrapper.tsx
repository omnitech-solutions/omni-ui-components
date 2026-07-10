/**
 * @fileoverview
 * `ComponentWrapper` — wrap a single JSX element and emit a matching Show
 * code panel underneath. Pure introspection: the wrapped element is rendered
 * verbatim, and its `type` + `props` drive the snippet.
 *
 * Usage:
 *
 *     <ComponentWrapper>
 *       <Table columns={defaultColumns} rows={matrixRows} size={args.size} />
 *     </ComponentWrapper>
 */
import * as React from 'react';

import { InlineCode } from './InlineCode';
import { ShowCodePanel } from './ShowCodePanel';
import { getRegisteredFixtures } from './fixtureRegistry';
import type { UseDynamicSnippetOptions } from './useDynamicSnippet';

export interface ComponentWrapperProps {
  /** A single JSX element — its `type` becomes the JSX tag in the code
   *  panel and its `props` become the emitted attributes. If the root
   *  element is a host tag (`div`, `section`, …), the wrapper walks into
   *  its children and introspects the first component element it finds,
   *  so a layout wrapper around a `<Table>` still emits the Table's
   *  snippet instead of the wrapper `<div>`. */
  children: React.ReactElement;
  /** Explicit element to introspect for the Show-code snippet. Overrides
   *  the auto-walk. Use for stories where the target isn't the first
   *  component element in the tree. */
  snippetTarget?: React.ReactElement;
  /** Short section title, rendered above the component in the AntD-style
   *  uppercase muted eyebrow (e.g. "Basic usage", "Tanstack-backed state"). */
  title?: string;
  /** Description body. Backtick-fenced tokens (`` `state` ``) are rendered as
   *  inline code with the same green accent AntD uses for API references. */
  description?: React.ReactNode;
  /** Identifier map — any prop value matching a fixture by reference becomes
   *  `{identifier}` in the snippet with a matching `const` declaration.
   *  Merged over the process-wide fixture registry (populated by fixture
   *  modules via `registerFixtures`). */
  fixtures?: Record<string, unknown>;
  /** Prop keys the snippet should omit (still passed to the component). */
  omit?: UseDynamicSnippetOptions['omit'];
  /** Extra preamble lines injected after fixture declarations. */
  extraPreamble?: UseDynamicSnippetOptions['extraPreamble'];
  /** Override the auto-detected component name (needed for anonymous or
   *  memo-wrapped components where introspection can't recover a name). */
  componentName?: string;
  /** Optional wrapper class. */
  className?: string;
  /** Language for the code panel. */
  language?: string;
  /** Whether to render the Show code panel. Defaults to `true`. Set to
   *  `false` to hide it entirely for the current story. */
  showCode?: boolean;
  /** Whether the Show code panel opens expanded by default. Defaults to
   *  `true` — the caller can override to `false` for stories where the
   *  code shouldn't steal focus. */
  defaultOpen?: boolean;
}

// Walk into host tags (`div`, `section`, …) to find the first React element
// whose `type` is an actual component. Lets a story wrap `<Table>` in a
// layout wrapper without the code panel showing the wrapper's tag.
const findComponentElement = (node: React.ReactNode): React.ReactElement | null => {
  if (!React.isValidElement(node)) return null;
  if (typeof node.type !== 'string') return node;
  let match: React.ReactElement | null = null;
  React.Children.forEach((node.props as { children?: React.ReactNode })?.children, (child) => {
    if (match) return;
    const found = findComponentElement(child);
    if (found) match = found;
  });
  return match;
};

// React.forwardRef / React.memo don't set `.name` — the inner render function
// carries the real name. Walk common wrapper shapes to recover it before
// falling back to the outer function's `.name`.
const resolveComponentName = (type: React.ReactElement['type']): string => {
  if (typeof type === 'string') return type;
  if (type == null) return 'Component';
  const anyType = type as {
    displayName?: string;
    name?: string;
    render?: { displayName?: string; name?: string };
    type?: { displayName?: string; name?: string };
  };
  if (anyType.displayName) return anyType.displayName;
  if (anyType.render?.displayName) return anyType.render.displayName;
  if (anyType.type?.displayName) return anyType.type.displayName;
  const raw = anyType.name || anyType.render?.name || anyType.type?.name;
  if (!raw) return 'Component';
  // `TableImpl` / `MyComponentImpl` → `Table` / `MyComponent`.
  return raw.replace(/Impl$/, '');
};

// Render a description string, turning backtick-fenced tokens into the shared
// prism-highlighted `<InlineCode>` used throughout the Docs pages. React nodes
// pass through as-is.
const renderDescription = (description: React.ReactNode): React.ReactNode => {
  if (typeof description !== 'string') return description;
  const parts = description.split(/(`[^`]+`)/g);
  return parts.map((part, index) => (part.startsWith('`') && part.endsWith('`') ? <InlineCode key={index} code={part.slice(1, -1)} /> : part));
};

export const ComponentWrapper: React.FC<ComponentWrapperProps> = ({
  children,
  snippetTarget,
  title,
  description,
  fixtures,
  omit,
  extraPreamble,
  componentName,
  className = 'grid gap-4',
  language = 'tsx',
  showCode = true,
  defaultOpen = false,
}) => {
  const root = React.Children.only(children);
  // Snippet introspection unwraps host-tag wrappers so a story that puts
  // `<Table>` inside a layout `<div>` still emits Table props, not the div.
  const element = snippetTarget ?? findComponentElement(root) ?? root;
  const name = componentName ?? resolveComponentName(element.type);
  const elementProps = (element.props ?? {}) as Record<string, unknown>;
  // Merge sources of identifier names, in priority order:
  //   1. The process-wide fixture registry (populated by fixture modules).
  //   2. Any explicit `fixtures={…}` prop on this <ComponentWrapper>.
  //   3. Any non-primitive prop value NOT already covered by 1–2 — auto-use
  //      the prop key as the identifier, so a story passing `rows={rows}`
  //      gets a matching `const rows = …;` emitted for free.
  const registered = getRegisteredFixtures();
  const propDerived: Record<string, unknown> = {};
  const isReactElement = (v: unknown): boolean => Boolean(v && typeof v === 'object' && '$$typeof' in (v as object));
  const containsReactElement = (v: unknown): boolean => Array.isArray(v) && v.some(isReactElement);
  for (const [key, value] of Object.entries(elementProps)) {
    if (value === null || (typeof value !== 'object' && typeof value !== 'function')) continue;
    // Skip React children / React elements — serializing them via `oneLine`
    // is meaningless and can throw on circular structures.
    if (key === 'children' || isReactElement(value) || containsReactElement(value)) continue;
    const registeredMatch = Object.entries(registered).find(([, v]) => v === value);
    const explicitMatch = fixtures && Object.entries(fixtures).find(([, v]) => v === value);
    if (!registeredMatch && !explicitMatch) propDerived[key] = value;
  }
  const mergedFixtures = { ...registered, ...propDerived, ...(fixtures ?? {}) };
  return (
    <div className={className} style={{ maxWidth: 800, minWidth: 600, marginInline: 'auto', width: '100%' }}>
      {(title || description) && (
        <header className="pb-pipeline-section" style={{ margin: 0 }}>
          {title && <h3 className="pb-pipeline-section-title">{title}</h3>}
          {description && <p style={{ margin: 0 }}>{renderDescription(description)}</p>}
        </header>
      )}
      {root}
      {showCode && (
        <ShowCodePanel
          language={language}
          defaultOpen={defaultOpen}
          dynamic={{
            componentName: name,
            props: elementProps,
            fixtures: mergedFixtures,
            omit,
            extraPreamble,
          }}
        />
      )}
    </div>
  );
};
