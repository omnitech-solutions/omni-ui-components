/**
 * @fileoverview
 * `buildDynamicSnippet` — pure snippet builder shared by `<ComponentWrapper>`
 * and Storybook's autodocs `source.transform` hook. `useDynamicSnippet` is a
 * thin memoized React hook that wraps the same logic.
 *
 * Callers pass the component name, the live props they render with, and a
 * map of `identifier → value` fixtures they import. Prop values that match
 * a fixture by reference are emitted as identifiers (`columns={defaultColumns}`);
 * matching `const <name> = <one-line>;` declarations are prepended so the
 * output reads top-to-bottom and can be pasted as-is.
 */
import { useMemo } from 'react';
import { oneLine } from './formatValue';
import { buildTableSnippet, type BuildTableSnippetOptions } from './tableSnippet';
import { getRegisteredFixtures } from './fixtureRegistry';

export interface UseDynamicSnippetOptions {
  /** Component name (with optional generic args). Rendered as the JSX tag. */
  componentName: string;
  /** Live props the story is rendering with. */
  props: Record<string, unknown>;
  /** Named fixtures the story imports. Merged over the process-wide fixture
   *  registry populated by fixture modules via `registerFixtures`. */
  fixtures?: Record<string, unknown>;
  /** Additional lines (e.g. helper consts) injected after fixture declarations. */
  extraPreamble?: string[];
  /** Prop keys the snippet should omit (defaults to `['testIdPrefix']`). */
  omit?: string[];
  /** Optional per-prop serializer override (see `buildTableSnippet`). */
  serializeProp?: BuildTableSnippetOptions['serializeProp'];
}

// Storybook-scaffolding props that every story bakes into its render but that
// a real consumer wouldn't type. Stripped from the emitted Show code by
// default so the snippet reads like the minimum API surface.
const DEFAULT_OMIT = ['testIdPrefix', 'size', 'bordered', 'showHeader', 'tableLayout', 'appearance', 'rowKey'];

export function buildDynamicSnippet(input: UseDynamicSnippetOptions): string {
  const { componentName, props, fixtures = {}, extraPreamble = [], omit, serializeProp } = input;

  const omitSet = new Set<string>([...DEFAULT_OMIT, ...(omit ?? [])]);

  // Merge explicit + registry fixtures, then hoist any non-primitive prop
  // value that isn't already named into a fixture keyed by its prop name
  // (so `rows={rows}` gets `const rows = …;` for free). Omitted props are
  // skipped so they don't leak into the preamble either.
  const registered = getRegisteredFixtures();
  const explicit = fixtures;
  const propDerived: Record<string, unknown> = {};
  const isReactElement = (v: unknown): boolean => Boolean(v && typeof v === 'object' && '$$typeof' in (v as object));
  const containsReactElement = (v: unknown): boolean => Array.isArray(v) && v.some(isReactElement);
  for (const [key, value] of Object.entries(props)) {
    if (omitSet.has(key)) continue;
    if (value === null || (typeof value !== 'object' && typeof value !== 'function')) continue;
    if (key === 'children' || isReactElement(value) || containsReactElement(value)) continue;
    const registeredMatch = Object.entries(registered).find(([, v]) => v === value);
    const explicitMatch = Object.entries(explicit).find(([, v]) => v === value);
    if (!registeredMatch && !explicitMatch) propDerived[key] = value;
  }
  const mergedFixtures = { ...registered, ...propDerived, ...explicit };

  const substituted: Record<string, unknown> = {};
  const referenced = new Set<string>();
  for (const [key, value] of Object.entries(props)) {
    const match = Object.entries(mergedFixtures).find(([, fixtureValue]) => fixtureValue === value);
    if (match) {
      substituted[key] = match[0];
      if (!omitSet.has(key)) referenced.add(match[0]);
    } else {
      substituted[key] = value;
    }
  }

  const jsx = buildTableSnippet(substituted, {
    componentName: componentName.replace(/<.*/, ''),
    typeArgs: componentName.match(/<(.*)>/)?.[1],
    imports: [],
    omit: [...DEFAULT_OMIT, ...(omit ?? [])],
    serializeProp: (key, value) => {
      if (typeof value === 'string' && referenced.has(value)) return `{${value}}`;
      return serializeProp?.(key, value) ?? null;
    },
  });

  const preambleLines: string[] = [];
  const ordered = Array.from(referenced).sort((a, b) => jsx.indexOf(a) - jsx.indexOf(b));
  for (const name of ordered) preambleLines.push(`const ${name} = ${oneLine(mergedFixtures[name])};`);
  if (extraPreamble.length) preambleLines.push('', ...extraPreamble);
  if (!preambleLines.length) return jsx;
  return `${preambleLines.join('\n')}\n\n${jsx}`;
}

export function useDynamicSnippet(input?: UseDynamicSnippetOptions): string {
  // Depend on primitive/reference-stable fields — callers pass a fresh
  // `{ componentName, props, … }` literal each render, so keying on `input`
  // itself would defeat the memo (`Object.is` never matches).
  const componentName = input?.componentName;
  const props = input?.props;
  const fixtures = input?.fixtures;
  const extraPreamble = input?.extraPreamble;
  const omit = input?.omit;
  const serializeProp = input?.serializeProp;
  return useMemo(
    () => (input ? buildDynamicSnippet(input) : ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [componentName, props, fixtures, extraPreamble, omit, serializeProp],
  );
}
