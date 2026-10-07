import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { makeFactory, type Variant } from '../internal/support/makeFactory';
import type { StreamStatusProps } from './StreamStatus.types';

/** Build `<StreamStatus>` props: a running tool call. */
export const streamStatusPropsFactory = makeFactory<StreamStatusProps>({
  kind: 'tool',
  toolName: 'search_docs',
  status: 'running',
  icon: <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" />,
});

export const streamStatusVariants: Variant<StreamStatusProps>[] = [
  { name: 'Tool running', args: {} },
  { name: 'Tool completed', args: { status: 'completed' } },
  { name: 'Tool failed', args: { status: 'failed' } },
  { name: 'Reasoning', args: { kind: 'reasoning', toolName: undefined } },
  { name: 'Stall', args: { kind: 'stall', toolName: undefined } },
  { name: 'No timer', args: { hideTimer: true } },
];
