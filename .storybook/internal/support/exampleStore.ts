/**
 * @fileoverview
 * What is known about a story's example outside the story's own React tree, by story id: the code Storybook
 * printed for its args, and anything a story registers about itself (`ComponentWrapper`: a title, a description
 * and the snippet built from the element it wraps). A docs page draws each story in a root of its own, so the
 * frame around a story reads this store instead of React context.
 */
import * as React from 'react';
import { storySourceToExample } from './storySource';

export type ExampleSnippets = string | Record<string, string>;
/** A snippet, a labelled map of snippets, or a function that gives either the first time the code is asked for. */
export type ExampleCode = ExampleSnippets | (() => ExampleSnippets | Promise<ExampleSnippets>);

export interface ExampleRecord {
  /** Code the story registered for itself. */
  code?: ExampleCode;
  /** The JSX Storybook printed from the story's args. */
  rendered?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
}

const records = new Map<string, ExampleRecord>();
const listeners = new Set<() => void>();

const publish = (id: string, patch: ExampleRecord) => {
  const current = records.get(id) ?? {};
  if (
    (Object.keys(patch) as Array<keyof ExampleRecord>).every((key) => current[key] === patch[key])
  )
    return;
  records.set(id, { ...current, ...patch });
  for (const listener of listeners) listener();
};

/** A story says what its frame shows: called from inside the story (see `ComponentWrapper`). */
export const registerExample = (id: string, patch: Omit<ExampleRecord, 'rendered'>) =>
  publish(id, patch);

/** Storybook printed this JSX for the story (see `renderedSource.ts`). */
export const recordRenderedSource = (id: string, source: string) =>
  publish(id, { rendered: source });

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const EMPTY: ExampleRecord = {};
export const useExampleRecord = (id: string | undefined): ExampleRecord =>
  React.useSyncExternalStore(
    subscribe,
    () => (id && records.get(id)) || EMPTY,
    () => EMPTY,
  );

/** The id of the story being drawn, for parts inside it that register with the store. Set by the preview decorator. */
export const ExampleStoryContext = React.createContext<string | undefined>(undefined);

interface StoryParameters {
  example?: { code?: ExampleCode };
  docs?: { source?: { code?: string; originalSource?: string } };
}

/**
 * The code shown for a story, first match wins: what the story registered, `parameters.example.code` (see
 * `exampleDocs`), a hand-written `parameters.docs.source.code`, the JSX Storybook printed from its args, and
 * last the example the story renders, as it is written in its file (see `storySourceToExample`).
 */
export const resolveExampleCode = (
  record: ExampleRecord,
  parameters: StoryParameters | undefined,
): ExampleCode | undefined =>
  record.code ??
  parameters?.example?.code ??
  parameters?.docs?.source?.code ??
  record.rendered ??
  (parameters?.docs?.source?.originalSource
    ? storySourceToExample(parameters.docs.source.originalSource)
    : undefined);
