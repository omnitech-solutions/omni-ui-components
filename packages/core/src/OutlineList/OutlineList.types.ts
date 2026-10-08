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
  /** `live` marks the item that is happening now: a green number and a green word in its meta line, no fill. */
  state?: 'default' | 'live';
  /** Plain text for the row's accessible name and tooltip when `label` is not a string. */
  name?: string;
  /** Drawn at the end of the row: a `Tag`, a `Badge`, a count. */
  trailing?: React.ReactNode;
}

/** What the list knows about a row when it draws it. */
export interface OutlineRowState {
  /** The number shown before the label. */
  number: number | string;
  /** This row is the one on show. */
  current: boolean;
  /** This row is happening now. */
  live: boolean;
}

/** One row on its own: usable outside the list, or returned from `renderItem` with changes. */
export interface OutlineListItemProps<T extends OutlineItem = OutlineItem>
  extends Partial<OutlineRowState> {
  item: T;
  /** The row was pressed. Without it the row is not pressable. */
  onSelect?: (item: T) => void;
  labels?: Partial<OutlineListLabels>;
  className?: string;
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
  /**
   * Draws a row in place of the default `OutlineListItem`. `select` chooses the item; return an
   * `OutlineListItem` with extra props, or any element with `data-slot="outline-list-row"`.
   */
  renderItem?: (item: T, state: OutlineRowState, select: () => void) => React.ReactNode;
  /** Shown in place of the rows when there are none. */
  empty?: React.ReactNode;
  labels?: Partial<OutlineListLabels>;
}
