import type * as React from 'react';

import type { ConversationItem } from '../ConversationList/ConversationList.types';

/** One row of the conversation menu. Extend it with your own fields; `onClick` gets the full row back. */
export interface ConversationMenuItem<M = any> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** Fires when the row is chosen, with the full menu item (the object you passed). A row without it (and without `startsRename`) is not rendered. A host may return a promise; it is ignored. */
  onClick?: (item: M) => void | Promise<void>;
  /** Destructive row (Delete). */
  danger?: boolean;
  /** Draw a divider before this row. */
  separated?: boolean;
  /** Choosing this row opens the inline rename field (the Rename row). `onClick` still runs first. */
  startsRename?: boolean;
  disabled?: boolean;
}

/** An icon button in the header (history, new chat, expand, settings, close). */
export interface ConversationHeaderAction<A = any> {
  key: string;
  icon?: React.ReactNode;
  /** Accessible name and tooltip. */
  label: string;
  /** Shown in the tooltip: `Close (⌘ J)`. */
  shortcut?: string;
  /** Fires when the button is chosen, with the full action item (the object you passed). A host may return a promise; it is ignored. */
  onClick: (action: A) => void | Promise<void>;
  /** Hide the action (default true). */
  visible?: boolean;
  disabled?: boolean;
}

export interface ConversationHeaderLabels {
  /** Accessible name of the toolbar. Default `Conversation`. */
  toolbar: string;
  /** Title shown when there is no conversation yet. Default `New conversation`. */
  untitled: string;
  /** Name of the rename field. Default `Conversation title`. */
  renameField: string;
  /** Name of the conversation menu. Default `Conversation menu`. */
  menu: string;
  /** Name of the history button. Default `Conversations`. */
  history: string;
}

export interface ConversationHeaderProps<
  C extends ConversationItem = ConversationItem,
  M extends ConversationMenuItem<M> = ConversationMenuItem,
  A extends ConversationHeaderAction<A> = ConversationHeaderAction,
> {
  /** The open conversation (the full item). Its `title` is shown; without one `labels.untitled` shows and the menu is off. Rename callbacks get this object back. */
  conversation?: C;
  /** Rows of the conversation menu. No rows: the title is plain text, not a menu button. */
  menuItems?: M[];
  /** Menu icon at the right of the title (the chevron). Shown only with menu rows. */
  menuIcon?: React.ReactNode;
  /** Fires when a rename is committed (Enter or blur) with the open conversation and the trimmed new title; only when non-empty and changed. Inline rename is off without it. */
  onRename?: (conversation: C, title: string) => void | Promise<void>;
  /** Fires with the open conversation when the rename field opens (the Rename row was chosen). */
  onRenameStart?: (conversation: C) => void;
  /** Fires with the open conversation when the rename is cancelled with Escape. */
  onRenameCancel?: (conversation: C) => void;
  /** Max length of the rename field. Default 256. */
  maxLength?: number;
  /** Controlled rename mode. Omit for an uncontrolled field that the menu's rename row opens. */
  renaming?: boolean;
  /** Fires when the history button is chosen (it toggles the conversation list). The button is not rendered without it. */
  onHistoryToggle?: () => void;
  /** Icon of the history button (caller node). */
  historyIcon?: React.ReactNode;
  /** Shown in the history button's tooltip: `⌘ K`. */
  historyShortcut?: string;
  /** Free slot before the title. */
  leading?: React.ReactNode;
  /** The model control (a ModelPicker trigger), right-aligned before the actions. */
  modelControl?: React.ReactNode;
  /** Buttons after the model control: new chat, expand or back, settings, close. */
  actions?: A[];
  /** Free slot at the far right. */
  trailing?: React.ReactNode;
  labels?: Partial<ConversationHeaderLabels>;
  className?: string;
  'data-testid'?: string;
}
