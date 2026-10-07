import type * as React from 'react';

export interface SummaryDividerLabels {
  /** The disclosure text. Default `3 earlier messages summarised` (singular for 1). */
  summarised: (count: number) => string;
  /** Line under the summary text. Default: the full history is still stored, only the model sees the summary. */
  note: string;
}

export interface SummaryDividerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** How many earlier messages the summary stands for. */
  count: number;
  /** The summary text shown when opened. */
  text?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  /** Fires whenever the disclosure opens or closes (controlled or not), with the new `open` state. */
  onOpenChange?: (open: boolean) => void;
  /** Icon node before the text (a compress glyph). */
  icon?: React.ReactNode;
  /** Icon node of the disclosure arrow; it turns over when open. */
  chevron?: React.ReactNode;
  labels?: Partial<SummaryDividerLabels>;
}
