import type * as React from 'react';

/** A value, or a function of the row it is rendered for (so one action config can show Pin on one row and Unpin on another). */
export type PerItem<T, R> = R | ((item: T) => R);

/** The minimum a row needs. Extend it with your own fields; `onOpen` and every row action get the full item back. */
export interface ConversationItem {
  id: string;
  title: string;
  pinned?: boolean;
}

/** One heading and its rows. Build them with `groupByRecency` or by hand. */
export interface ConversationListGroup<T extends ConversationItem = ConversationItem> {
  key: string;
  label: string;
  items: T[];
}

/** A hover action on a row: Pin / Unpin, Delete, Restore. Every field except `key` and `onClick` may depend on the row. */
export interface ConversationRowAction<T extends ConversationItem = ConversationItem> {
  key: string;
  /** Caller-supplied icon node; return a filled variant for the pressed state of a toggle. */
  icon?: PerItem<T, React.ReactNode>;
  /** Accessible name and tooltip (`Pin` / `Unpin`). */
  label: PerItem<T, string>;
  /** Fires when the action is chosen, with the full conversation item (the same object you passed in `groups`). A host may return a promise; it is ignored. */
  onClick: (conversation: T) => void | Promise<void>;
  /** Hide the action on rows where it does not apply (default true). */
  visible?: PerItem<T, boolean>;
  /** Toggle state: sets `aria-pressed`. Leave undefined for a plain action. */
  pressed?: PerItem<T, boolean>;
  /** `danger` tints the hover colour (Delete). */
  tone?: 'default' | 'danger';
}

/** Every user-visible string. Plural and format strings are functions. */
export interface ConversationListLabels {
  /** Heading and accessible name of the navigation. Default `Conversations`. */
  title: string;
  /** Heading while `archived` is on. Default `Archived`. */
  archivedTitle: string;
  /** New chat button name. Default `New chat`. */
  newChat: string;
  /** Back button name in the archived view. Default `Back`. */
  back: string;
  /** Close button name in overlay mode. Default `Close`. */
  close: string;
  /** Placeholder and name of the search field. Default `Search conversations`. */
  searchPlaceholder: string;
  /** Empty search result: `No conversations match "q"`. */
  noMatch: (query: string) => string;
  /** No conversations at all. Default `No conversations yet`. */
  none: string;
  /** No archived conversations. Default `No archived conversations`. */
  noneArchived: string;
  /** The button that opens the archived view: `Archived · 3`. */
  archivedButton: (count: number) => string;
}

export interface ConversationListProps<T extends ConversationItem = ConversationItem> {
  /** Headed groups of rows, in display order. Empty groups are skipped. */
  groups: ConversationListGroup<T>[];
  /** The open conversation: its row gets `aria-current`. */
  activeId?: string;
  /** Fires when a row's title is chosen, with the full conversation item (the same object you passed in `groups`). Without it the titles are plain text. */
  onOpen?: (conversation: T) => void | Promise<void>;
  /** Hover actions of every row, in order. */
  rowActions?: ConversationRowAction<T>[];
  /** `docked`: sits beside the conversation. `overlay`: floats over it (full-page vs side-panel mode). Default `docked`. */
  docked?: boolean;
  /** Fires when Close is chosen (overlay mode). The button is not rendered without it, or when docked. */
  onClose?: () => void | Promise<void>;
  /** Fires when New chat is chosen. The button is not rendered without it. */
  onNewChat?: () => void | Promise<void>;
  /** Shortcut hint in the New chat tooltip: `⌘ ⇧ O`. */
  newChatShortcut?: string;
  /** Search value (controlled). Omit for an uncontrolled field starting at `defaultQuery`. */
  query?: string;
  defaultQuery?: string;
  /** Fires on every keystroke with the new text, controlled or not: the caller debounces. The search field is not rendered without it. */
  onSearchChange?: (query: string) => void;
  /** Key hint at the right of the search field: `⌘K`. */
  searchShortcut?: string;
  /** Focus target for the global search shortcut. */
  searchRef?: React.Ref<HTMLInputElement>;
  /** Archived view: the heading says Archived, the header shows Back (`onBack`), search and the archived button hide. */
  archived?: boolean;
  /** Fires when Back is chosen in the archived view. The button is not rendered without it. */
  onBack?: () => void | Promise<void>;
  /** Count shown on the archived button; the button is hidden unless `onShowArchived` is given. */
  archivedCount?: number;
  /** Fires when the `Archived · N` button is chosen. The button is not rendered without it. */
  onShowArchived?: () => void | Promise<void>;
  /** Shown instead of the built-in message when there are no rows. */
  empty?: React.ReactNode;
  /** Pinned under the list: `ConversationListFooter`, or anything. */
  footer?: React.ReactNode;
  /** Icons are caller nodes; a missing one shows the first letter of the control's label. */
  icons?: {
    search?: React.ReactNode;
    newChat?: React.ReactNode;
    back?: React.ReactNode;
    close?: React.ReactNode;
    archived?: React.ReactNode;
  };
  labels?: Partial<ConversationListLabels>;
  className?: string;
  'data-testid'?: string;
}

/** The signed-in person and the settings gear at the foot of the list. */
export interface ConversationListFooterProps {
  user?: { name: string; detail?: string; initials?: string };
  /** Fires when the gear is chosen. The gear is not rendered without it. */
  onOpenSettings?: () => void | Promise<void>;
  settingsIcon?: React.ReactNode;
  /** Name of the gear button. Default `Settings`. */
  settingsLabel?: string;
  className?: string;
}
