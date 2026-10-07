import type * as React from 'react';

/** Where one step is. `pending` has not started, `running` is in progress, `done` finished, `failed` finished with an error. */
export type StepTimelineState = 'pending' | 'running' | 'done' | 'failed';

export interface StepTimelineStep {
  id: string;
  /** Icon node of the step (a tool glyph). */
  icon?: React.ReactNode;
  /** Label of the step once done (and while pending). */
  label: React.ReactNode;
  /** Label while it is `running`. Default: `label`. */
  activeLabel?: React.ReactNode;
  /** Quiet text after the label, e.g. `3 passages`. Shown when the step is not running (a running step shows `labels.working`). */
  detail?: React.ReactNode;
  state: StepTimelineState;
  /** The step ran beside others: shows the quiet `parallel` tag. */
  parallel?: boolean;
}

/** The overall state the summary line describes. */
export type StepTimelineStatus = 'running' | 'waiting' | 'stopped' | 'done';

export interface StepTimelineLabels {
  /** Summary while one step runs; `{label}` is its running label. Default `{label}…`. */
  running: string;
  /** Summary while several run or wait; `{label}` is the first label, `{n}` the others. Default `{label} + {n} more…`. */
  runningMore: string;
  /** Summary when the run waits for a decision. Default `Waiting for your approval`. */
  waiting: string;
  /** Summary when the run stopped with steps unfinished. Default `Stopped while working`. */
  stopped: string;
  /** Summary when every step finished; `count` steps, optional `seconds` for the whole run. Default `Used 3 tools · 4.2s`. */
  done: (count: number, seconds?: number) => string;
  /** Detail of a running step. Default `…`. */
  working: string;
  /** The parallel tag. Default `parallel`. */
  parallel: string;
}

export interface StepTimelineIcons {
  /** A finished step (check). */
  done?: React.ReactNode;
  /** A failed step. */
  failed?: React.ReactNode;
  /** The disclosure arrow of the summary button; it turns over when open. */
  chevron?: React.ReactNode;
  /** Replaces the built-in CSS spinner. */
  spinner?: React.ReactNode;
}

export interface StepTimelineProps<T extends StepTimelineStep = StepTimelineStep>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  steps: T[];
  /** `summary` (default): a collapsible summary button and a list. `rail`: a vertical dotted timeline shown while working or open. */
  variant?: 'summary' | 'rail';
  /**
   * What the summary line says. Default: `running` when a step runs, `stopped` when steps are unfinished and none
   * runs, `done` otherwise. Pass `waiting` yourself when the run waits for approval.
   */
  status?: StepTimelineStatus;
  /** Whole-run duration in seconds for the done summary. */
  seconds?: number;
  /** Expanded state (controlled). */
  open?: boolean;
  defaultOpen?: boolean;
  /** Fires whenever the disclosure opens or closes (controlled or not), with the new `open` state. */
  onOpenChange?: (open: boolean) => void;
  /** Replaces the summary line. */
  summary?: React.ReactNode;
  icons?: StepTimelineIcons;
  /** Accessible name of the disclosure group. Default `Steps`. */
  label?: string;
  labels?: Partial<StepTimelineLabels>;
}
