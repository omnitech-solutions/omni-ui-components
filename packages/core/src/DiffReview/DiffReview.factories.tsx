import {
  Ban,
  CheckCircle2,
  CircleAlert,
  Eye,
  FileCode2,
  FileText,
  FlaskConical,
  GitCompareArrows,
  Info,
  ListChecks,
  Undo2,
} from 'lucide-react';
import * as React from 'react';

import { highlightLines } from '../Highlight';
import { makeFactory, type Variant } from '../internal/support/makeFactory';
import { DiffReview } from './DiffReview';
import type {
  DiffChange,
  DiffReviewAction,
  DiffReviewActionContext,
  DiffReviewIcons,
  DiffReviewProps,
  DiffReviewStatus,
  DiffReviewVariant,
} from './DiffReview.types';

// ---------------------------------------------------------------------------------------------------------------
// Fixtures: the three surfaces of a proposed change to a small answer (notes, code, tests).
// ---------------------------------------------------------------------------------------------------------------

export const NOTES_CHANGE: DiffChange = {
  id: 'notes',
  label: 'Notes',
  description: 'Talking points for the answer',
  icon: <FileText />,
  before: [
    '## Approach',
    '- Sort the intervals by start.',
    '- Merge while they overlap.',
    '',
    '## Complexity',
    '- O(n log n) time.',
  ].join('\n'),
  after: [
    '## Approach',
    '- Sort the intervals by start.',
    '- Sweep once, extending the open interval while the next start is inside it.',
    '',
    '## Complexity',
    '- O(n log n) time, O(n) space for the output.',
    '- The sort dominates; the sweep is O(n).',
  ].join('\n'),
};

export const CODE_CHANGE: DiffChange = {
  id: 'code',
  label: 'Code',
  description: 'mergeIntervals.ts',
  icon: <FileCode2 />,
  language: 'ts',
  before: [
    'export function mergeIntervals(items: number[][]): number[][] {',
    '  const sorted = [...items].sort((a, b) => a[0] - b[0]);',
    '  const out: number[][] = [];',
    '  for (const item of sorted) {',
    '    const last = out[out.length - 1];',
    '    if (last && item[0] <= last[1]) last[1] = item[1];',
    '    else out.push(item);',
    '  }',
    '  return out;',
    '}',
  ].join('\n'),
  after: [
    'export function mergeIntervals(items: number[][]): number[][] {',
    '  const sorted = [...items].sort((a, b) => a[0] - b[0]);',
    '  const out: number[][] = [];',
    '  for (const [start, end] of sorted) {',
    '    const last = out[out.length - 1];',
    '    if (last && start <= last[1]) last[1] = Math.max(last[1], end);',
    '    else out.push([start, end]);',
    '  }',
    '  return out;',
    '}',
  ].join('\n'),
};

export const TESTS_CHANGE: DiffChange = {
  id: 'tests',
  label: 'Tests',
  description: 'mergeIntervals.test.ts',
  icon: <FlaskConical />,
  language: 'ts',
  before: [
    "it('merges overlaps', () => {",
    '  expect(mergeIntervals([[1, 3], [2, 6]])).toEqual([[1, 6]]);',
    '});',
  ].join('\n'),
  after: [
    "it('merges overlaps', () => {",
    '  expect(mergeIntervals([[1, 3], [2, 6]])).toEqual([[1, 6]]);',
    '});',
    '',
    "it('keeps a contained interval inside its parent', () => {",
    '  expect(mergeIntervals([[1, 9], [2, 3]])).toEqual([[1, 9]]);',
    '});',
  ].join('\n'),
};

/** The three changes of a proposal; `count` takes the first n. */
export const sampleChanges = (count = 3): DiffChange[] =>
  [NOTES_CHANGE, CODE_CHANGE, TESTS_CHANGE].slice(0, count);

/** A long single-surface diff: two edits far apart in a 60-line file, so the `⋯` gap row shows. */
export const longChange = (): DiffChange => {
  const lines = Array.from({ length: 60 }, (_, index) => `const value${index + 1} = ${index + 1};`);
  const after = [...lines];
  after[2] = 'const value3 = 30; // tuned';
  after[52] = 'const value53 = 530; // tuned';
  return {
    id: 'long',
    label: 'config.ts',
    language: 'ts',
    before: lines.join('\n'),
    after: after.join('\n'),
  };
};

/** Every phase of a card: the status pill and the footer note. */
export const DIFF_REVIEW_STATUSES: DiffReviewStatus[] = [
  'pending',
  'preview',
  'applied',
  'rejected',
  'reverted',
  'conflicted',
];

export const DIFF_REVIEW_ICONS: DiffReviewIcons = {
  badge: <GitCompareArrows />,
  checklistBadge: <ListChecks />,
  change: <FileText />,
  notes: {
    pending: <Info />,
    preview: <Eye />,
    applied: <CheckCircle2 />,
    rejected: <Ban />,
    reverted: <Undo2 />,
    conflicted: <CircleAlert />,
  },
};

// ---------------------------------------------------------------------------------------------------------------
// phaseActions: which buttons a card shows in each phase (the table of the original Proposal card).
// ---------------------------------------------------------------------------------------------------------------

/** Button text of `phaseActions`. Defaults are English; pass a partial to translate. */
export interface DiffReviewActionLabels {
  apply: string;
  applyBoth: string;
  applyAll: string;
  applyCount: (count: number) => string;
  reject: string;
  discard: string;
  preview: string;
  previewChecklist: string;
  stopPreview: string;
  undo: string;
  restore: string;
  reapply: string;
}

export const DEFAULT_DIFF_REVIEW_ACTION_LABELS: DiffReviewActionLabels = {
  apply: 'Apply',
  applyBoth: 'Apply both',
  applyAll: 'Apply all',
  applyCount: (count) => `Apply ${count}`,
  reject: 'Reject',
  discard: 'Discard',
  preview: 'Preview in app',
  previewChecklist: 'Preview',
  stopPreview: 'Stop preview',
  undo: 'Undo',
  restore: 'Restore proposal',
  reapply: 'Re-apply',
};

/** What the app does for each button; a button exists only when its handler does (no `onPreview`, no Preview). */
export interface PhaseActionHandlers {
  /** Gets the ticked ids in the checklist variant, every id otherwise. */
  onApply?: (context: DiffReviewActionContext) => void | Promise<void>;
  onReject?: () => void | Promise<void>;
  onPreview?: () => void | Promise<void>;
  onStopPreview?: () => void | Promise<void>;
  onUndo?: () => void | Promise<void>;
  onRestore?: () => void | Promise<void>;
}

export interface PhaseActionsOptions extends PhaseActionHandlers {
  status: DiffReviewStatus;
  variant?: DiffReviewVariant;
  /** A request is in flight: every button is off. */
  working?: boolean;
  labels?: Partial<DiffReviewActionLabels>;
}

/**
 * The footer actions of a DiffReview per phase:
 *
 * | status     | buttons                                                                                  |
 * |------------|------------------------------------------------------------------------------------------|
 * | pending    | Reject (Discard in the checklist), Preview (Preview in app) when `onPreview`, Apply      |
 * | preview    | Stop preview, Apply                                                                      |
 * | applied    | Undo, when `onUndo`                                                                      |
 * | rejected   | Restore proposal, when `onRestore`                                                       |
 * | reverted   | Re-apply                                                                                 |
 * | conflicted | none                                                                                     |
 *
 * In the checklist the Apply label follows the selection (Apply both, Apply all, Apply 2) and Apply is off with
 * nothing ticked.
 */
export function phaseActions({
  status,
  variant = 'diff',
  working = false,
  labels: labelsProp,
  ...handlers
}: PhaseActionsOptions): DiffReviewAction[] {
  const labels = { ...DEFAULT_DIFF_REVIEW_ACTION_LABELS, ...labelsProp };
  const checklist = variant === 'checklist';
  const apply = (key: string, text: string): DiffReviewAction[] =>
    !handlers.onApply
      ? []
      : [
          {
            key,
            primary: true,
            label: ({ selected, changes, variant: shown }) =>
              shown === 'checklist'
                ? selected.length === changes.length
                  ? changes.length === 2
                    ? labels.applyBoth
                    : labels.applyAll
                  : labels.applyCount(selected.length)
                : text,
            disabled: ({ selected, variant: shown }) =>
              working || (shown === 'checklist' && selected.length === 0),
            onClick: (context) => handlers.onApply?.(context),
          },
        ];
  const plain = (
    key: string,
    label: string,
    onClick?: () => void | Promise<void>,
  ): DiffReviewAction[] => (onClick ? [{ key, label, disabled: working, onClick }] : []);

  switch (status) {
    case 'pending':
      return [
        ...plain('reject', checklist ? labels.discard : labels.reject, handlers.onReject),
        ...plain(
          'preview',
          checklist ? labels.previewChecklist : labels.preview,
          handlers.onPreview,
        ),
        ...apply('apply', labels.apply),
      ];
    case 'preview':
      return [
        ...plain('stop-preview', labels.stopPreview, handlers.onStopPreview),
        ...apply('apply', labels.apply),
      ];
    case 'applied':
      return plain('undo', labels.undo, handlers.onUndo).map((action) => ({
        ...action,
        icon: <Undo2 />,
      }));
    case 'rejected':
      return plain('restore', labels.restore, handlers.onRestore);
    case 'reverted':
      return handlers.onApply
        ? [
            {
              key: 'reapply',
              label: labels.reapply,
              disabled: working,
              onClick: (context) => handlers.onApply?.(context),
            },
          ]
        : [];
    case 'conflicted':
      return [];
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Props factory and variants (stories, overview, tests).
// ---------------------------------------------------------------------------------------------------------------

/** Build `<DiffReview>` props with highlighting and icons on. */
export const diffReviewPropsFactory = makeFactory<DiffReviewProps>({
  changes: sampleChanges(),
  status: 'pending',
  variant: 'diff',
  highlight: highlightLines,
  icons: DIFF_REVIEW_ICONS,
  product: 'Studio',
  actions: phaseActions({
    status: 'pending',
    onApply: () => undefined,
    onReject: () => undefined,
    onPreview: () => undefined,
  }),
});

const withActions = (status: DiffReviewStatus, variant: DiffReviewVariant = 'diff') =>
  phaseActions({
    status,
    variant,
    onApply: () => undefined,
    onReject: () => undefined,
    onPreview: () => undefined,
    onStopPreview: () => undefined,
    onUndo: () => undefined,
    onRestore: () => undefined,
  });

export const diffReviewVariants: Variant<DiffReviewProps>[] = [
  { name: 'Diff, pending', args: { actions: withActions('pending') } },
  { name: 'Diff, previewing', args: { status: 'preview', actions: withActions('preview') } },
  { name: 'Diff, applied', args: { status: 'applied', actions: withActions('applied') } },
  { name: 'Diff, rejected', args: { status: 'rejected', actions: withActions('rejected') } },
  { name: 'Diff, rolled back', args: { status: 'reverted', actions: withActions('reverted') } },
  { name: 'Diff, conflicted', args: { status: 'conflicted', actions: withActions('conflicted') } },
  {
    name: 'Checklist, pending',
    args: { variant: 'checklist', actions: withActions('pending', 'checklist') },
  },
  {
    name: 'Diff, no highlighting',
    args: { highlight: undefined, actions: withActions('pending') },
  },
  {
    name: 'Diff, long (gap rows)',
    args: { changes: [longChange()], actions: withActions('pending') },
  },
  {
    name: 'Fallback (no changes)',
    args: {
      changes: [],
      fallback: '{\n  "patch": { "notes": "…" }\n}',
      actions: withActions('pending'),
    },
  },
];

// ---------------------------------------------------------------------------------------------------------------
// Demo: a card that walks through its phases the way an app would (story and overview only).
// ---------------------------------------------------------------------------------------------------------------

export interface DiffReviewDemoProps extends Partial<Omit<DiffReviewProps, 'actions'>> {
  /** Called with the name of each transition and, for an apply, the ids applied. */
  onAction?: (name: string, detail?: unknown) => void;
  /** Offer the in-app preview. Default true. */
  preview?: boolean;
}

/** Owns the status; wires `phaseActions` to it. Apply → Applied → Undo → Rolled back → Re-apply, Reject → Restore. */
export const DiffReviewDemo: React.FC<DiffReviewDemoProps> = ({
  status: initial = 'pending',
  variant = 'diff',
  onAction,
  preview = true,
  ...props
}) => {
  const [status, setStatus] = React.useState<DiffReviewStatus>(initial);
  React.useEffect(() => setStatus(initial), [initial]);
  const go = (name: string, next: DiffReviewStatus, detail?: unknown) => {
    setStatus(next);
    onAction?.(name, detail);
  };
  return (
    <DiffReview
      {...diffReviewPropsFactory({ variant })}
      {...props}
      variant={variant}
      status={status}
      actions={phaseActions({
        status,
        variant,
        onApply: ({ selected }) =>
          go(
            'apply',
            'applied',
            selected.map((change) => change.id),
          ),
        onReject: () => go('reject', 'rejected'),
        onPreview: preview ? () => go('preview', 'preview') : undefined,
        onStopPreview: () => go('stop-preview', 'pending'),
        onUndo: () => go('undo', 'reverted'),
        onRestore: () => go('restore', 'pending'),
      })}
    />
  );
};
