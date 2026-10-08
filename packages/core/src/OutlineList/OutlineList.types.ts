import type * as React from 'react';

/** English strings of {@link OutlineList}. */
export interface OutlineListLabels {
  /** Accessible name of the list when no `aria-label` is given. */
  list: string;
  /** Word shown beside the item that is happening now. */
  live: string;
}

/** One entry to jump to. Extend it: the item reaches `onValueChange` by reference. */
export interface OutlineItem {
  id: string;
  label: React.ReactNode;
  /** A quiet second line: a time, a count. */
  meta?: React.ReactNode;
  /** Shown before the label. Defaults to the item's position, counted from 1 in the order given. */
  number?: number | string;
  /** `live` marks the item that is happening now (green). */
  state?: 'default' | 'live';
  /** Plain text for the row's accessible name and tooltip when `label` is not a string. */
  name?: string;
}

export interface OutlineListProps<T extends OutlineItem = OutlineItem>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  items: readonly T[];
  /** The id of the item on show (controlled). */
  value?: string | null;
  defaultValue?: string | null;
  /** An item was chosen. Without it the rows are not pressable. */
  onValueChange?: (item: T) => void;
  /** `reversed` draws the last item first (newest at the top). Numbers keep the order given. */
  order?: 'as-given' | 'reversed';
  /** Shown in place of the rows when there are none. */
  empty?: React.ReactNode;
  labels?: Partial<OutlineListLabels>;
}
