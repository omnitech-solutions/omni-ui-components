import type * as React from 'react';

import { makeFactory, type Variant } from '../internal/support/makeFactory';
import { ContextMeter } from './ContextMeter';
import type { ContextMeterProps, ContextSection } from './ContextMeter.types';

export const SAMPLE_SECTIONS: ContextSection[] = [
  { label: 'Instructions & memory', tokens: 600 },
  { label: 'Workspace', tokens: 900 },
  { label: 'Conversation', tokens: 1600 },
];

/** Build `<ContextMeter>` props: 3.1k of a 262k window. */
export const contextMeterPropsFactory = makeFactory<ContextMeterProps>({
  used: 3100,
  window: 262000,
  sections: SAMPLE_SECTIONS,
  onSummarise: () => undefined,
});

export const contextMeterVariants: Variant<ContextMeterProps>[] = [
  { name: 'Low (1%)', args: {} },
  { name: 'Half (50%)', args: { used: 131000 } },
  { name: 'Warn (70%)', args: { used: 183400 } },
  { name: 'Danger (90%)', args: { used: 235800 } },
  { name: 'Full (clamped to 100%)', args: { used: 300000 } },
  { name: 'No window (empty ring)', args: { window: undefined, used: 1200 } },
  {
    name: 'Custom thresholds (30 / 50)',
    args: { used: 100000, window: 262000, thresholds: { warn: 30, danger: 50 } },
  },
  { name: 'No summarise button', args: { onSummarise: undefined } },
];

/** A meter that is already open, for stories that show the popover. */
export const OpenContextMeter: React.FC<Partial<ContextMeterProps>> = (props) => (
  <ContextMeter {...contextMeterPropsFactory()} defaultOpen {...props} />
);
