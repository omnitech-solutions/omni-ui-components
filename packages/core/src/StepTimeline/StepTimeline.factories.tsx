import * as React from 'react';
import { Check, ChevronDown, FilePen, Search, X } from 'lucide-react';

import type { StepTimelineProps, StepTimelineStep } from '@oc-tech/omni-ui-components/StepTimeline';
import type { Variant } from '../../internal/support/makeFactory';

export const doneSteps = (): StepTimelineStep[] => [
  {
    id: 'a',
    icon: <Search />,
    label: 'Searched evidence',
    detail: '3 passages',
    state: 'done',
    parallel: true,
  },
  {
    id: 'b',
    icon: <Search />,
    label: 'Searched notes',
    detail: 'No matching passages',
    state: 'done',
    parallel: true,
  },
  {
    id: 'c',
    icon: <FilePen />,
    label: 'Drafted a change',
    detail: 'Waiting for your review',
    state: 'done',
  },
];

export const runningSteps = (): StepTimelineStep[] => [
  {
    id: 'a',
    icon: <Search />,
    label: 'Searched evidence',
    detail: '3 passages',
    state: 'done',
  },
  {
    id: 'b',
    icon: <FilePen />,
    label: 'Drafted a change',
    activeLabel: 'Drafting a change',
    state: 'running',
  },
  {
    id: 'c',
    icon: <Search />,
    label: 'Searched notes',
    activeLabel: 'Searching notes',
    state: 'pending',
  },
];

export const failedSteps = (): StepTimelineStep[] => [
  {
    id: 'a',
    icon: <Search />,
    label: 'Searched evidence',
    detail: '3 passages',
    state: 'done',
  },
  {
    id: 'b',
    icon: <FilePen />,
    label: 'Drafted a change',
    detail: 'Refused — the model tried again',
    state: 'failed',
  },
];

/** Build `<StepTimeline>` props for stories and tests. */
export const stepTimelinePropsFactory = (overrides: Partial<StepTimelineProps> = {}): StepTimelineProps => ({
  steps: doneSteps(),
  seconds: 4.2,
  icons: { done: <Check />, failed: <X />, chevron: <ChevronDown /> },
  ...overrides,
});

export const stepTimelineVariants: Variant<StepTimelineProps>[] = [
  { name: 'Summary · done', args: {} },
  { name: 'Summary · open', args: { defaultOpen: true } },
  {
    name: 'Summary · running',
    args: { steps: runningSteps(), defaultOpen: true },
  },
  {
    name: 'Summary · waiting',
    args: { steps: runningSteps(), status: 'waiting' },
  },
  {
    name: 'Summary · stopped',
    args: { steps: runningSteps(), status: 'stopped' },
  },
  { name: 'Rail · running', args: { variant: 'rail', steps: runningSteps() } },
  { name: 'Rail · done, open', args: { variant: 'rail', defaultOpen: true } },
  {
    name: 'Rail · failed step',
    args: { variant: 'rail', steps: failedSteps(), defaultOpen: true },
  },
];
