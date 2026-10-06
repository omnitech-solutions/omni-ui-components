import * as React from 'react';

/** The base item of an error: extend it with your own fields (a run, a code) and they reach `onRetry` and `onDismiss`. */
export interface ErrorItem {
  id: string;
  title: React.ReactNode;
  message?: React.ReactNode;
  note?: React.ReactNode;
}

export interface ErrorCardProps<T extends ErrorItem = ErrorItem> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The error to show; `title`, `message` and `note` default to its fields, and the props below override them. Callbacks receive it by reference. */
  error?: T;
  /**
   * `error` (default): a danger card, `role="alert"`, with a Retry button. `stopped`: the quiet one-line banner
   * (`role="status"`) shown when a person stopped the reply.
   */
  variant?: 'error' | 'stopped';
  /** Bold first line (error) or the banner text (stopped). */
  title?: React.ReactNode;
  /** Explanation under the title. */
  message?: React.ReactNode;
  /** Reassurance line under the message, e.g. `Your message is saved and nothing has been applied.` */
  note?: React.ReactNode;
  /** Icon node (a warning glyph for the card, a stop glyph for the banner). */
  icon?: React.ReactNode;
  /** Fires when Retry is chosen, with the full `error` item (or `{ id, title, message, note }` built from the props when none was given). Retry is drawn only when this is set. */
  onRetry?: (error: T) => void | Promise<void>;
  /** Retry label. Default `Retry`. */
  retryLabel?: React.ReactNode;
  /** Icon node of the Retry button. */
  retryIcon?: React.ReactNode;
  /** Disables Retry, e.g. while another run is busy. */
  retryDisabled?: boolean;
  /** Fires when the dismiss control is chosen, with the same item as `onRetry`. The control (top right) is drawn only when this is set. */
  onDismiss?: (error: T) => void | Promise<void>;
  /** Accessible name of the dismiss control. Default `Dismiss`. */
  dismissLabel?: string;
  /** Icon node of the dismiss control. Without it the control shows `×`. */
  dismissIcon?: React.ReactNode;
  /** Extra actions drawn after Retry, e.g. a Switch model button. */
  actions?: React.ReactNode;
}
