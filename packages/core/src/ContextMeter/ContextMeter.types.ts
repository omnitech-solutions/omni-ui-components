import * as React from 'react';

/** One line of the breakdown; extend it with your own fields and the extended type reaches `onSummarise`. (`Instructions & memory`, `Workspace`, `Conversation`). */
export interface ContextSection {
  label: string;
  tokens: number;
}

/** Percent above which the ring turns amber (`warn`) and red (`danger`). Both are exclusive: exactly 60% is still normal. */
export interface ContextThresholds {
  warn: number;
  danger: number;
}

export type ContextLevel = 'normal' | 'warn' | 'danger';

/** Every visible string. Count formats are functions so a locale can reorder the words. */
export interface ContextMeterLabels {
  /** Ring tooltip and accessible name when the window is known. */
  title: (percent: number) => string;
  /** Ring tooltip when there is no window; `used` is formatted (`1.2k`). */
  titleNoWindow: (used: string) => string;
  /** Accessible name of the dialog. */
  dialog: string;
  /** Heading inside the dialog. */
  heading: string;
  /** Heading value when there is no window; `used` is formatted. */
  approx: (used: string) => string;
  /** `About 3.1k of 262k tokens`; `window` is undefined without a window. */
  summary: (used: string, window?: string) => string;
  note: string;
  summarise: string;
}

export interface ContextMeterProps<S extends ContextSection = ContextSection> extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'children' | 'title'> {
  /** Estimated tokens in context. */
  used: number;
  /** The model's window in tokens. Without it the ring is empty and no percent is shown. */
  window?: number;
  /** Rows of the breakdown, in tokens. */
  sections?: S[];
  /** Default `{ warn: 60, danger: 80 }`. */
  thresholds?: ContextThresholds;
  /** Controlled open state; leave unset for an uncontrolled popover. */
  open?: boolean;
  defaultOpen?: boolean;
  /** Fires when the popover opens or closes (ring, Escape, outside click), in controlled and uncontrolled mode. Payload: the new open state. */
  onOpenChange?: (open: boolean) => void;
  /** Fires when "Summarise now" is chosen. Payload: the `sections` array as passed in (same objects, extra fields intact). The button exists only when this is given. A returned promise is ignored. */
  onSummarise?: (sections: S[]) => void | Promise<void>;
  /** Size of the ring in px. Default 20. */
  ringSize?: number;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom';
  labels?: Partial<ContextMeterLabels>;
  /** Classes of the popover. */
  menuClassName?: string;
  /** Portal target for the popover; default `document.body`. Lets a native host render it inside its own root. */
  container?: HTMLElement | null;
  'data-testid'?: string;
}
