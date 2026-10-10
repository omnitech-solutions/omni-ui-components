/**
 * @fileoverview
 * `ComponentWrapper` — wrap a single JSX element and give its frame a matching
 * snippet. Pure introspection: the wrapped element is rendered verbatim, and
 * its `type` + `props` drive the snippet. The wrapper draws nothing of its
 * own: the title, the description and the code go to the story's
 * `ExampleFrame` (the story view's, or the docs page's) through the example
 * store, so an example has one frame and one code bar wherever it is shown.
 *
 * Usage:
 *
 *     <ComponentWrapper>
 *       <Table columns={defaultColumns} rows={matrixRows} size={args.size} />
 *     </ComponentWrapper>
 */
import * as React from 'react';
import { renderCodeAwareText } from './codeAwareText';
import { ExampleStoryContext, registerExample } from './exampleStore';
import { getRegisteredFixtures } from './fixtureRegistry';
import { type UseDynamicSnippetOptions, useDynamicSnippet } from './useDynamicSnippet';

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
  /** Whether the frame shows the snippet. Defaults to `true`. */
  showCode?: boolean;
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
  showCode = true,
}) => {
  const storyId = React.useContext(ExampleStoryContext);
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
  const isReactElement = (v: unknown): boolean =>
    Boolean(v && typeof v === 'object' && '$$typeof' in (v as object));
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
  const mergedFixtures = { ...registered, ...propDerived, ...fixtures };
  const snippet = useDynamicSnippet({
    componentName: name,
    props: elementProps,
    fixtures: mergedFixtures,
    omit,
    extraPreamble,
  });
  const shownDescription = typeof description === 'string' ? description : undefined;
  // The frame is outside this tree (and on a docs page in another root): it reads what is registered here.
  React.useEffect(() => {
    if (!storyId) return;
    registerExample(storyId, {
      title,
      description: shownDescription ? renderCodeAwareText(shownDescription) : description,
      code: showCode ? snippet : '',
    });
    // A description given as elements is new on every render: the string, when it is one, stands for it.
    // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  }, [storyId, title, shownDescription, snippet, showCode]);
  return (
    <div className={className} style={{ maxWidth: 800, marginInline: 'auto', width: '100%' }}>
      {root}
    </div>
  );
};
