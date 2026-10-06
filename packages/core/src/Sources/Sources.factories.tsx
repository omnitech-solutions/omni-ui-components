import * as React from 'react';
import { FileText, X } from 'lucide-react';

import type { SourceItem, SourcesProps } from '@oc-tech/omni-ui-components/Sources';
import type { Variant } from '../../internal/support/makeFactory';

export const sampleSources = (): SourceItem[] => [
  {
    id: 's1',
    n: 1,
    title: 'Two Sum notes',
    meta: 'rev 3 · Notes',
    quote: 'Store each value with its index so the complement is a single lookup.',
  },
  {
    id: 's2',
    n: 2,
    title: 'Map reference',
    meta: 'MDN',
    quote: 'A Map holds key-value pairs and remembers the original insertion order of the keys.',
  },
  {
    id: 's3',
    n: 3,
    title: 'Complexity cheatsheet',
    quote: 'Hash lookups are O(1) on average.',
  },
];

/** Build `<Sources>` props for stories and tests. */
export const sourcesPropsFactory = (overrides: Partial<SourcesProps> = {}): SourcesProps => ({
  items: sampleSources(),
  cardIcon: <FileText />,
  closeIcon: <X />,
  ...overrides,
});

export const sourcesVariants: Variant<SourcesProps>[] = [
  { name: 'Chips only', args: {} },
  { name: 'Second source open', args: { defaultOpenN: 2 } },
  {
    name: 'One source',
    args: { items: sampleSources().slice(0, 1), defaultOpenN: 1 },
  },
];
