import * as React from 'react';

export interface FeedbackPanelLabels {
  /** Heading. Default `What went wrong?`. */
  title: string;
  cancel: string;
  /** Default `Send feedback`. */
  submit: string;
  /** Placeholder and accessible name of the optional note field. Default `Anything else? (optional)`. */
  notePlaceholder: string;
}

/** The base item of a reason chip: extend it with your own fields (a code, a severity) and they reach every callback. */
export interface FeedbackReason {
  id: string;
  label: string;
}

/** What Send reports: the chosen reason items (by reference, in the order chosen) and the note when there is one. */
export interface FeedbackSubmission<T extends FeedbackReason = FeedbackReason> {
  reasons: T[];
  note?: string;
}

export interface FeedbackPanelProps<T extends FeedbackReason = FeedbackReason> extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title' | 'onSubmit' | 'autoFocus'
> {
  /** The reasons offered as toggle chips. */
  reasons: T[];
  /** Ids of the chosen reasons (controlled). */
  selected?: string[];
  /** Ids chosen initially when uncontrolled. */
  defaultSelected?: string[];
  /** Fires with the whole new list of chosen reason items whenever a chip toggles (controlled or not). */
  onSelectedChange?: (selected: T[]) => void;
  /** Fires when one chip toggles, with the full reason item and whether it is now chosen. */
  onToggle?: (reason: T, selected: boolean) => void;
  /** Draw a free-text note under the chips; its text is `note` of the submission. Default false. */
  withNote?: boolean;
  /** Fires when Send is chosen, with `{ reasons, note? }` (`note` undefined when empty or `withNote` is off). Send is drawn only when this is set. */
  onSubmit?: (feedback: FeedbackSubmission<T>) => void | Promise<void>;
  /** Fires when Cancel is chosen. Cancel is drawn only when this is set. */
  onCancel?: () => void | Promise<void>;
  /** Disables Send, e.g. while the request is in flight. */
  submitDisabled?: boolean;
  labels?: Partial<FeedbackPanelLabels>;
  /** Move focus to the first reason chip when the panel mounts (a thumbs-down just opened it). Default false. */
  autoFocus?: boolean;
}
