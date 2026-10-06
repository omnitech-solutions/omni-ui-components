import * as React from 'react';

import type { CodeToken, HighlightFn } from '../Highlight';

/** One reviewable surface (a file, a note, a test): its text before and after the proposed change. */
export interface DiffChange {
  id: string;
  /** Tab label in the diff variant, row title in the checklist. */
  label: string;
  /** Second line under the label in the checklist. */
  description?: string;
  /** Row icon in the checklist (caller-supplied node). */
  icon?: React.ReactNode;
  /** Language handed to the `highlight` function (`ts`, `python`, ...). */
  language?: string;
  before: string;
  after: string;
}

/** Where the proposal is in its life. The caller owns the transitions; this only draws them. */
export type DiffReviewStatus = 'pending' | 'preview' | 'applied' | 'rejected' | 'reverted' | 'conflicted';

/** `diff`: one tab per change with its unified diff. `checklist`: one selectable row per change (needs more than one change). */
export type DiffReviewVariant = 'diff' | 'checklist';

/** Added and removed line counts of one change, or the sum of several. */
export interface DiffStats {
  added: number;
  removed: number;
}

/** What an action's label, disabled state and handler are told about the current selection. */
export interface DiffReviewActionContext<C extends DiffChange = DiffChange> {
  /** Every change, the same objects the caller passed in. */
  changes: C[];
  /** The ticked changes (every change in the diff variant), the caller's own objects. */
  selected: C[];
  /** The variant in effect (a checklist with a single change falls back to `diff`). */
  variant: DiffReviewVariant;
  status: DiffReviewStatus;
}

/** A footer button. The app decides which actions exist for the current status (see `phaseActions` in the factories). */
export interface DiffReviewAction<C extends DiffChange = DiffChange> {
  key: string;
  /** Text, or a function of the selection (`Apply 2`). */
  label: React.ReactNode | ((context: DiffReviewActionContext<C>) => React.ReactNode);
  /** The one filled button of the footer. */
  primary?: boolean;
  /** Boolean, or a function of the selection (Apply is off with nothing ticked). */
  disabled?: boolean | ((context: DiffReviewActionContext<C>) => boolean);
  icon?: React.ReactNode;
  /**
   * Fires when the button is chosen. Payload: `{ changes, selected, variant, status }` with the full change objects (by
   * reference, extra fields intact), so the host can apply partially. The host does its work here (save, call a server)
   * and then changes `status`. A returned promise is ignored. Without it the button is not rendered.
   */
  onClick: (context: DiffReviewActionContext<C>) => void | Promise<void>;
}

/** Every visible string. `{product}` in a note is replaced by the `product` prop. */
export interface DiffReviewLabels {
  /** Accessible name of the card. */
  region: string;
  title: string;
  /** Title of the checklist variant. */
  checklistTitle: (count: number) => string;
  /** Subtitle of the diff variant: `2 surfaces · +4 −1`. */
  summary: (count: number, added: number, removed: number) => string;
  /** Subtitle while there are no changes to show. */
  emptySummary: string;
  checklistHint: string;
  /** Status pill text. */
  statuses: Record<DiffReviewStatus, string>;
  /** Footer note per status; may use `{product}`. */
  notes: Record<DiffReviewStatus, string>;
  /** Accessible name of the tab list. */
  tabs: string;
  /** Accessible name of the `⋯` row standing for hidden unchanged lines. */
  gap: string;
}

/** The icons the card can show. All optional; without them the slot is simply not drawn. */
export interface DiffReviewIcons {
  /** Header badge in the diff variant. */
  badge?: React.ReactNode;
  /** Header badge in the checklist variant. */
  checklistBadge?: React.ReactNode;
  /** Row icon when a change has none. */
  change?: React.ReactNode;
  /** Icon before the footer note, per status. */
  notes?: Partial<Record<DiffReviewStatus, React.ReactNode>>;
}

export interface DiffReviewProps<C extends DiffChange = DiffChange> extends Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  changes: C[];
  status?: DiffReviewStatus;
  variant?: DiffReviewVariant;
  /** Syntax highlighter (the library's `highlightLines`, or any {@link HighlightFn}). Without it lines are plain text. */
  highlight?: HighlightFn;
  /** Unchanged lines kept around each change; the rest collapse into `⋯`. Default 1. */
  contextLines?: number;
  /** Footer buttons, in order. */
  actions?: DiffReviewAction<C>[];
  /** Replaces the status note (e.g. a conflict explanation). */
  note?: React.ReactNode;
  /** Product name for the `{product}` placeholder of the notes. */
  product?: string;
  /** Shown instead of the diff when `changes` is empty (the raw proposal). */
  fallback?: React.ReactNode;
  labels?: Partial<DiffReviewLabels>;
  icons?: DiffReviewIcons;
  /** Open tab (diff variant), controlled. */
  activeId?: string;
  /** Tab open at the start when uncontrolled. Default: the first change. */
  defaultActiveId?: string;
  /** Fires when the person opens another tab (click or keys), in controlled and uncontrolled mode. Payload: the change (the caller's object). */
  onTabChange?: (change: C) => void;
  /** Ticked change ids (checklist), controlled. Unset: all ticked, tracked inside. */
  selectedIds?: string[];
  /** Fires when a checklist row is ticked or unticked, in both modes. Payload: the ticked changes in change order (the caller's objects). */
  onSelectionChange?: (selected: C[]) => void;
  'data-testid'?: string;
}

/** One line of a rendered diff. */
export type DiffRow = { kind: 'add' | 'remove' | 'context'; tokens: CodeToken[] } | { kind: 'gap' };

export interface DiffRowsOptions {
  highlight?: HighlightFn;
  language?: string;
  /** Unchanged lines kept on each side of a change. Default 1. */
  contextLines?: number;
}
