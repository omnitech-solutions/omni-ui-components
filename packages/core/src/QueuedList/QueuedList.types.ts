import * as React from 'react';

/** A message waiting for the running reply to finish. */
export interface QueuedItem {
  id: string;
  text: string;
}

export interface QueuedListLabels {
  /** Small label before each row's text. Default `Queued`. */
  queued: string;
  /** Accessible name of a row's remove button. Default `Remove from queue`. */
  remove: string;
  /** Accessible name of the list. Default `Queued messages`. */
  list: string;
}

export const DEFAULT_QUEUED_LABELS: QueuedListLabels = { queued: 'Queued', remove: 'Remove from queue', list: 'Queued messages' };

export interface QueuedListProps<T extends QueuedItem = QueuedItem> extends Omit<React.HTMLAttributes<HTMLUListElement>, 'children'> {
  /** The queued messages. Extend {@link QueuedItem} with your own fields: `onRemove` hands the same object back. */
  items: T[];
  /** A row's remove button was chosen. Payload: the full item (the same object from `items`). Absent: no remove buttons. */
  onRemove?: (item: T) => void | Promise<void>;
  /** Icon node before each row (e.g. a send-later glyph). */
  icon?: React.ReactNode;
  /** Icon node of the remove button. Without it a plain `×` shows. */
  removeIcon?: React.ReactNode;
  labels?: Partial<QueuedListLabels>;
}
