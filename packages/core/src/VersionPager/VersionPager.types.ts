import * as React from 'react';

export interface VersionPagerLabels {
  previous: string;
  next: string;
  /** Accessible name of the group. Default `Versions`. */
  group: string;
  /** The position text. Default `1 / 3`. */
  position: (index: number, count: number) => string;
}

/** The base item of a version (an edit of your message, a regeneration): extend it with your own fields and they reach the callbacks. */
export interface VersionItem {
  id: string;
}

export interface VersionPagerProps<T extends VersionItem = VersionItem> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
  /** 0-based index of the shown version. */
  index: number;
  /** Number of versions. Default: `versions.length`. */
  count?: number;
  /** The versions, as full items. Optional: without them the pager is purely numeric and `onSelect` never fires. */
  versions?: T[];
  /**
   * Fires when Previous (`-1`) or Next (`1`) is chosen, with the step and the version being left (`versions[index]`, by
   * reference; undefined without `versions`). The caller loads the other version and updates `index`.
   */
  onMove?: (step: -1 | 1, current?: T) => void | Promise<void>;
  /** Fires at the same moment as `onMove` when `versions` is set, with the version moved to (by reference) and its index. */
  onSelect?: (version: T, index: number) => void | Promise<void>;
  /** Disables both buttons, e.g. while a reply is running. */
  disabled?: boolean;
  /** Icon nodes of the two buttons. Without them the buttons show `‹` and `›`. */
  previousIcon?: React.ReactNode;
  nextIcon?: React.ReactNode;
  labels?: Partial<VersionPagerLabels>;
}
