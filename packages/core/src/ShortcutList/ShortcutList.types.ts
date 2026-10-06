/** One row. Extend it with your own fields (the list is generic over it). */
export interface ShortcutItem {
  /** Stable key; defaults to `label`. */
  id?: string;
  label: string;
  /** A shortcut string (`mod+shift+o`, described with `describe`) or the key glyphs ready to show (`['⌘', 'K']`). */
  keys: string | string[];
}

export interface ShortcutListLabels {
  /** Accessible name of the list. Default `Keyboard shortcuts`. */
  title: string;
}

export interface ShortcutListProps<S extends ShortcutItem = ShortcutItem> {
  items: S[];
  /** Turns a shortcut string into key glyphs. Default `describeShortcutKeys` (⌘ ⇧ ⌥ on a Mac). */
  describe?: (shortcut: string) => string[];
  /** A visible heading above the list. Omit for none (the list is still named by `labels.title`). */
  title?: React.ReactNode;
  labels?: Partial<ShortcutListLabels>;
  className?: string;
}

import type * as React from 'react';
