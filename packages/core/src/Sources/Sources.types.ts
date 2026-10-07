import type * as React from 'react';

/** One source a reply cites. `n` is the number the reply's `[n]` pills use. */
export interface SourceItem {
  id: string;
  n: number;
  title: string;
  /** Quiet text next to the title, e.g. `rev 3 · Notes`. */
  meta?: string;
  /** The passage the reply relied on, shown in the card as a quotation. */
  quote: string;
}

export interface SourcesLabels {
  /** Accessible name of the chip group. Default `Sources`. */
  group: string;
  /** Name and tooltip of the card's close control. Default `Close`. */
  close: string;
}

export interface SourcesProps<T extends SourceItem = SourceItem>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  items: T[];
  /** The source whose card is open (controlled). `null` is controlled and closed. */
  openN?: number | null;
  /** Initial open source when uncontrolled. */
  defaultOpenN?: number | null;
  /**
   * Fires whenever a source's card opens or closes (controlled or not), with the full source item and its new `open`
   * state. Choosing the open chip again, the close control, or opening another source closes the previous one first.
   */
  onToggle?: (source: T, open: boolean) => void;
  /** Fires when the card's close control is chosen, with the full source item that was open (after `onToggle(source, false)`). */
  onClose?: (source: T) => void;
  /** Icon node before the card title. */
  cardIcon?: React.ReactNode;
  /** Icon node of the card's close control. Without it the close control shows a plain `×`. */
  closeIcon?: React.ReactNode;
  /** Replaces the card of the open source. */
  renderCard?: (item: T, close: () => void) => React.ReactNode;
  labels?: Partial<SourcesLabels>;
}
